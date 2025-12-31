"""
Parser for macOS Unified Logging System (log show command).
Supports various log types: system, kernel, auth, hardware, power, scheduler.
"""
import subprocess
import json
from typing import List, Dict, Any, Optional
from datetime import datetime
from backend.parsers.base_parser import BaseLogParser


class UnifiedLogParser(BaseLogParser):
    """
    Parser for macOS Unified Logging System.
    Uses 'log show' command with predicates to filter logs.
    """
    
    def __init__(
        self,
        predicate: str,
        log_type: str = "system",
        time_period: str = "1h",
        limit: Optional[int] = None,
        style: str = "syslog"
    ):
        """
        Initialize Unified Log Parser.
        
        Args:
            predicate: Log predicate filter (e.g., 'process == "kernel"')
            log_type: Human-readable log type name (for metadata)
            time_period: Time range for logs (e.g., "1h", "24h")
            limit: Maximum number of entries
            style: Output style (syslog, compact, json)
        """
        super().__init__(time_period, limit)
        self.predicate = predicate
        self.log_type = log_type
        self.style = style
    
    def fetch(self) -> str:
        """
        Execute 'log show' command to fetch logs.
        
        Returns:
            str: Raw log output
        
        Raises:
            subprocess.CalledProcessError: If log command fails
            FileNotFoundError: If 'log' command not found
        """
        cmd = ["log", "show", "--last", self.time_period, "--style", self.style]
        
        # Only add predicate if it's not empty
        if self.predicate and self.predicate.strip():
            cmd.extend(["--predicate", self.predicate])
        
        try:
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                check=True,
                timeout=30  # 30 second timeout
            )
            return result.stdout
        except subprocess.TimeoutExpired:
            raise RuntimeError(f"Log command timed out after 30 seconds")
        except subprocess.CalledProcessError as e:
            raise RuntimeError(
                f"Log command failed with code {e.returncode}: {e.stderr}"
            )
        except FileNotFoundError:
            raise FileNotFoundError(
                "Unified Logging System not available. Requires macOS 10.12+"
            )
    
    def parse(self, raw_data: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        Parse unified log output into structured format.
        
        Args:
            raw_data: Optional raw log data. If None, calls fetch().
        
        Returns:
            List[Dict[str, Any]]: Parsed log entries
        """
        if raw_data is None:
            raw_data = self.fetch()
        
        if not raw_data.strip():
            return []
        
        entries = []
        lines = raw_data.strip().split('\n')
        
        for line in lines:
            if not line.strip():
                continue
            
            # Skip header lines that don't match log format
            # Real log lines should have timestamp format: YYYY-MM-DD HH:MM:SS
            if len(line) < 19 or not line[0:4].isdigit():  # First 4 chars should be year
                continue
            
            # Parse syslog-style format:
            # 2024-01-15 10:30:45.123456-0800  hostname  process[PID]: message
            entry = self._parse_syslog_line(line)
            # Only add entries that have a valid timestamp (not None, not "Timestamp")
            if entry and entry.get('timestamp'):
                entries.append(entry)
        
        # Apply limit if specified
        if self.limit and len(entries) > self.limit:
            entries = entries[:self.limit]
        
        return entries
    
    def _parse_syslog_line(self, line: str) -> Optional[Dict[str, Any]]:
        """
        Parse a single syslog-formatted line.
        
        Format: YYYY-MM-DD HH:MM:SS.ffffff-TZ  hostname  process[PID]: message
        or: YYYY-MM-DD HH:MM:SS.ffffff-TZ  hostname  process[PID]: [subsystem] message
        
        Args:
            line: Raw log line
        
        Returns:
            Dict with parsed fields, or None if parsing fails
        """
        try:
            # Split timestamp from rest (split on double space)
            parts = line.split('  ', 1)  # Split on first double space only
            if len(parts) < 2:
                return None
            
            timestamp_str = parts[0].strip()
            rest = parts[1].strip()
            
            # Now split rest on first single space to get hostname and remainder
            rest_parts = rest.split(' ', 1)
            if len(rest_parts) < 2:
                return None
            
            hostname = rest_parts[0].strip()
            remainder = rest_parts[1].strip()
            
            # Skip if timestamp is invalid
            if not timestamp_str or timestamp_str == 'Timestamp' or not timestamp_str[0:4].isdigit():
                return None
            
            # Parse remainder: process[PID]: message
            # Find the first PID bracket pair (process[PID])
            pid_end = remainder.find(']')
            if pid_end == -1:
                return None
            
            pid_start = remainder.rfind('[', 0, pid_end)
            if pid_start == -1:
                return None
            
            process = remainder[:pid_start].strip()
            pid = remainder[pid_start + 1:pid_end]
            
            # Find message start - look for ': ' after PID bracket
            # This handles formats like: process[PID]: message or process[PID]: [subsystem] message
            message_start = remainder.find(':', pid_end)
            if message_start == -1:
                # No colon found, try to extract message from after PID bracket
                message = remainder[pid_end + 1:].strip()
                level = "Unknown"
            else:
                # Skip the colon and space
                message = remainder[message_start + 1:].strip()
                
                # Try to extract level if present (format: <Level>: message)
                level_start = message.find('<')
                if level_start != -1 and level_start < 20:  # Level usually near start
                    level_end = message.find('>', level_start)
                    if level_end != -1:
                        level = message[level_start + 1:level_end]
                        message = message[level_end + 1:].strip()
                        # Remove leading ':' if present
                        if message.startswith(':'):
                            message = message[1:].strip()
                    else:
                        level = "Unknown"
                else:
                    level = "Unknown"
            
            return {
                "timestamp": timestamp_str,
                "hostname": hostname,
                "process": process,
                "pid": pid,
                "level": level,
                "message": message,
                "log_type": self.log_type,
                "raw": line
            }
        except Exception as e:
            # If parsing fails, return None instead of entry with parse_error
            # This prevents adding invalid entries to the results
            return None
