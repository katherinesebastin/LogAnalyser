"""
Parser for Homebrew and package manager logs.
Reads from /opt/homebrew/var/log/ or /usr/local/var/log/
"""
import os
from typing import List, Dict, Any, Optional
from pathlib import Path
from backend.parsers.base_parser import BaseLogParser


class PackageLogParser(BaseLogParser):
    """
    Parser for Homebrew package manager logs.
    """
    
    def __init__(self, limit: Optional[int] = None):
        """
        Initialize Package Log Parser.
        
        Args:
            limit: Maximum number of entries to return
        """
        super().__init__(time_period="", limit=limit)
        # Check for Homebrew in both possible locations
        self.homebrew_paths = [
            Path("/opt/homebrew/var/log"),  # Apple Silicon
            Path("/usr/local/var/log"),      # Intel
        ]
    
    def fetch(self) -> str:
        """
        Find Homebrew log directory.
        
        Returns:
            str: Path to log directory, or empty if not found
        """
        for path in self.homebrew_paths:
            if path.exists():
                return str(path)
        return ""
    
    def parse(self, raw_data: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        Parse package/Homebrew logs.
        
        Args:
            raw_data: Optional log directory path. If None, calls fetch().
        
        Returns:
            List[Dict[str, Any]]: Parsed log entries
        """
        if raw_data is None:
            log_dir_path = self.fetch()
        else:
            log_dir_path = raw_data
        
        if not log_dir_path:
            return []
        
        log_dir = Path(log_dir_path)
        if not log_dir.exists():
            return []
        
        entries = []
        
        # Look for common Homebrew log files
        log_files = [
            log_dir / "brew.log",
            log_dir / "brew_update.log",
            log_dir / "brew_install.log",
        ]
        
        # Also check for any .log files
        log_files.extend(log_dir.glob("*.log"))
        
        for log_file in log_files:
            if not log_file.exists():
                continue
            
            try:
                file_entries = self._parse_log_file(log_file)
                entries.extend(file_entries)
            except Exception:
                continue
        
        # Sort by timestamp (if available) or file modification time
        # Handle None values properly
        entries.sort(key=lambda x: (
            x.get('timestamp') or '',
            x.get('file_mtime') or 0
        ), reverse=True)
        
        # Apply limit
        if self.limit and len(entries) > self.limit:
            entries = entries[:self.limit]
        
        return entries
    
    def _parse_log_file(self, file_path: Path) -> List[Dict[str, Any]]:
        """
        Parse a single log file.
        
        Args:
            file_path: Path to log file
        
        Returns:
            List of log entries
        """
        entries = []
        
        try:
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                lines = f.readlines()
            
            for line_num, line in enumerate(lines, 1):
                line = line.strip()
                if not line:
                    continue
                
                # Try to parse timestamp (format varies)
                timestamp = None
                message = line
                
                # Common log formats
                if ':' in line and len(line.split(':')[0]) > 10:
                    parts = line.split(':', 2)
                    if len(parts) >= 3:
                        timestamp = parts[0].strip()
                        message = ':'.join(parts[1:]).strip()
                
                entry = {
                    "timestamp": timestamp or None,
                    "message": message,
                    "file_name": file_path.name,
                    "file_path": str(file_path),
                    "line_number": line_num,
                    "file_mtime": file_path.stat().st_mtime,
                    "log_type": "package"
                }
                
                entries.append(entry)
        except Exception:
            pass
        
        return entries

