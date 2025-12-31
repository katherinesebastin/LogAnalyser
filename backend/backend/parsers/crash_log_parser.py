"""
Parser for macOS crash logs (.crash and .ips files).
Reads from ~/Library/Logs/DiagnosticReports/ and /Library/Logs/DiagnosticReports/
"""
import os
import json
from typing import List, Dict, Any, Optional
from pathlib import Path
from backend.parsers.base_parser import BaseLogParser


class CrashLogParser(BaseLogParser):
    """
    Parser for macOS crash logs.
    Supports .crash (text) and .ips (JSON) formats.
    """
    
    def __init__(self, limit: Optional[int] = None):
        """
        Initialize Crash Log Parser.
        
        Args:
            limit: Maximum number of entries to return
        """
        super().__init__(time_period="", limit=limit)
        self.user_reports_dir = Path.home() / "Library/Logs/DiagnosticReports"
        self.system_reports_dir = Path("/Library/Logs/DiagnosticReports")
    
    def fetch(self) -> str:
        """
        Find all crash log files.
        
        Returns:
            str: JSON string of file paths found
        """
        crash_files = []
        
        # Check user directory
        if self.user_reports_dir.exists():
            crash_files.extend(
                self.user_reports_dir.glob("*.crash")
            )
            crash_files.extend(
                self.user_reports_dir.glob("*.ips")
            )
        
        # Check system directory
        if self.system_reports_dir.exists():
            crash_files.extend(
                self.system_reports_dir.glob("*.crash")
            )
            crash_files.extend(
                self.system_reports_dir.glob("*.ips")
            )
        
        # Sort by modification time (newest first)
        crash_files.sort(key=lambda p: p.stat().st_mtime, reverse=True)
        
        # Return as JSON string for compatibility
        return json.dumps([str(f) for f in crash_files])
    
    def parse(self, raw_data: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        Parse crash log files into structured format.
        
        Args:
            raw_data: Optional JSON string of file paths. If None, calls fetch().
        
        Returns:
            List[Dict[str, Any]]: Parsed crash log entries
        """
        if raw_data is None:
            file_paths_json = self.fetch()
        else:
            file_paths_json = raw_data
        
        file_paths = json.loads(file_paths_json)
        entries = []
        
        for file_path in file_paths:
            try:
                path = Path(file_path)
                if not path.exists():
                    continue
                
                entry = self._parse_crash_file(path)
                if entry:
                    entries.append(entry)
            except Exception as e:
                # Skip files that can't be parsed
                continue
        
        # Apply limit
        if self.limit and len(entries) > self.limit:
            entries = entries[:self.limit]
        
        return entries
    
    def _parse_crash_file(self, file_path: Path) -> Optional[Dict[str, Any]]:
        """
        Parse a single crash log file (.crash or .ips).
        
        Args:
            file_path: Path to crash log file
        
        Returns:
            Dict with parsed crash info, or None if parsing fails
        """
        try:
            if file_path.suffix == '.ips':
                return self._parse_ips_file(file_path)
            elif file_path.suffix == '.crash':
                return self._parse_crash_text_file(file_path)
        except Exception:
            return None
        
        return None
    
    def _parse_ips_file(self, file_path: Path) -> Optional[Dict[str, Any]]:
        """Parse .ips (JSON) crash log file."""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            # Extract key information
            crash_info = {
                "file_path": str(file_path),
                "file_name": file_path.name,
                "format": "ips",
                "timestamp": data.get("timestamp", None),
                "incident_id": data.get("incidentID", None),
                "process": data.get("process", None),
                "exception_type": data.get("exception", {}).get("values", [{}])[0].get("type", None) if data.get("exception") else None,
                "exception_message": data.get("exception", {}).get("values", [{}])[0].get("value", None) if data.get("exception") else None,
                "crash_location": file_path.parent.name,
                "file_size": file_path.stat().st_size,
                "modified_time": file_path.stat().st_mtime
            }
            
            return crash_info
        except Exception:
            return None
    
    def _parse_crash_text_file(self, file_path: Path) -> Optional[Dict[str, Any]]:
        """Parse .crash (text) crash log file."""
        try:
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                lines = f.readlines()
            
            # Extract basic info from crash log header
            crash_info = {
                "file_path": str(file_path),
                "file_name": file_path.name,
                "format": "crash",
                "timestamp": None,
                "process": None,
                "exception_type": None,
                "exception_message": None,
                "crash_location": file_path.parent.name,
                "file_size": file_path.stat().st_size,
                "modified_time": file_path.stat().st_mtime,
                "preview": "".join(lines[:20])  # First 20 lines as preview
            }
            
            # Try to extract process name from header
            for line in lines[:30]:
                if "Process:" in line:
                    crash_info["process"] = line.split("Process:")[1].strip().split()[0]
                if "Date/Time:" in line:
                    crash_info["timestamp"] = line.split("Date/Time:")[1].strip()
            
            return crash_info
        except Exception:
            return None

