"""
Base parser class for all log parsers.
Provides common interface and helper methods.
"""
from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
from datetime import datetime


class BaseLogParser(ABC):
    """
    Abstract base class for all log parsers.
    
    All parsers should inherit from this and implement:
    - parse(): Parse raw log data into structured format
    - fetch(): Retrieve log data from source
    """
    
    def __init__(self, time_period: str = "1h", limit: Optional[int] = None):
        """
        Initialize parser with common parameters.
        
        Args:
            time_period: Time range (e.g., "1h", "24h", "1d")
            limit: Maximum number of entries to return
        """
        self.time_period = time_period
        self.limit = limit
    
    @abstractmethod
    def fetch(self) -> str:
        """
        Fetch raw log data from source (file, subprocess, etc.).
        
        Returns:
            str: Raw log data
        """
        pass
    
    @abstractmethod
    def parse(self, raw_data: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        Parse raw log data into structured format.
        
        Args:
            raw_data: Optional raw data. If None, calls fetch().
        
        Returns:
            List[Dict[str, Any]]: List of parsed log entries
        """
        pass
    
    def to_json(self) -> List[Dict[str, Any]]:
        """
        Convenience method to fetch and parse in one call.
        
        Returns:
            List[Dict[str, Any]]: Parsed log entries
        """
        return self.parse()
    
    @staticmethod
    def normalize_timestamp(timestamp_str: str) -> Optional[str]:
        """
        Normalize timestamp strings to ISO 8601 format.
        
        Args:
            timestamp_str: Raw timestamp string
        
        Returns:
            str: ISO 8601 formatted timestamp, or None if parsing fails
        """
        # This will be implemented to handle various timestamp formats
        # For now, return as-is if it's already a reasonable format
        return timestamp_str
