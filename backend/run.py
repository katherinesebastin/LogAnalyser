"""
Main entry point for macOS Log Analyzer backend.
"""
import sys
import os

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

from backend.api.app import app
from backend.utils.system_check import check_macos_version, verify_unified_logging


def main():
    """Main entry point with startup checks."""
    print("macOS Log Analyzer Backend")
    print("=" * 40)
    
    # Check macOS version
    compatible, msg = check_macos_version()
    if not compatible:
        print(f"ERROR: {msg}")
        sys.exit(1)
    print(f"✓ {msg}")
    
    # Check Unified Logging System
    unified_ok, unified_msg = verify_unified_logging()
    if not unified_ok:
        print(f"ERROR: {unified_msg}")
        sys.exit(1)
    print(f"✓ {unified_msg}")
    
    print("\nStarting API server...")
    print("API available at: http://127.0.0.1:5000")
    print("Health check: http://127.0.0.1:5000/api/health")
    print("System logs: http://127.0.0.1:5000/api/logs/system")
    print("\nPress Ctrl+C to stop\n")
    
    app.run(debug=True, host='127.0.0.1', port=5000)


if __name__ == '__main__':
    main()
