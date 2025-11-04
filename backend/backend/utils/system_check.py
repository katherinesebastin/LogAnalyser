"""
System check utilities for macOS Log Analyzer.
Ensures we're running on macOS 10.12+ (Sierra and later).
"""
import platform
import sys
from typing import Tuple


def check_macos_version() -> Tuple[bool, str]:
    """
    Check if running on macOS 10.12+.
    
    Returns:
        Tuple[bool, str]: (is_compatible, message)
    """
    system = platform.system()
    
    if system != "Darwin":
        return False, f"This tool only supports macOS. Detected: {system}"
    
    # Get macOS version
    version_str = platform.mac_ver()[0]  # e.g., "10.15.7" or "13.2.1"
    
    if not version_str:
        return False, "Could not detect macOS version."
    
    # Parse version (handle both 10.x and 11+ formats)
    try:
        major, minor = map(int, version_str.split('.')[:2])
        
        # macOS 10.12 = Sierra (first with Unified Logging System)
        if major > 10:
            return True, f"macOS {version_str} is compatible (10.12+ required)"
        elif major == 10 and minor >= 12:
            return True, f"macOS {version_str} is compatible (10.12+ required)"
        else:
            return False, f"macOS {version_str} is too old. Requires 10.12+ (Sierra)"
    except (ValueError, IndexError):
        return False, f"Could not parse macOS version: {version_str}"


def verify_unified_logging() -> Tuple[bool, str]:
    """
    Verify that the 'log' command is available (Unified Logging System).
    
    Returns:
        Tuple[bool, str]: (is_available, message)
    """
    import shutil
    
    log_path = shutil.which("log")
    if log_path:
        return True, f"Unified Logging System found at: {log_path}"
    else:
        return False, "Unified Logging System not found. 'log' command unavailable."


if __name__ == "__main__":
    compatible, msg = check_macos_version()
    print(msg)
    if compatible:
        unified_ok, unified_msg = verify_unified_logging()
        print(unified_msg)
        sys.exit(0 if unified_ok else 1)
    else:
        sys.exit(1)
