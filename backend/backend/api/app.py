"""
Flask API for macOS Log Analyzer.
Provides endpoints to query various log types.
"""
from flask import Flask, jsonify, request
from flask_cors import CORS
from typing import Optional
import sys
import os

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from backend.utils.system_check import check_macos_version, verify_unified_logging
from backend.parsers.unified_log_parser import UnifiedLogParser
from backend.parsers.crash_log_parser import CrashLogParser
from backend.parsers.package_log_parser import PackageLogParser


app = Flask(__name__)
CORS(app)  # Enable CORS for frontend


@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    compatible, msg = check_macos_version()
    unified_ok, unified_msg = verify_unified_logging()
    
    return jsonify({
        "status": "ok" if (compatible and unified_ok) else "error",
        "macos_compatible": compatible,
        "macos_message": msg,
        "unified_logging_available": unified_ok,
        "unified_logging_message": unified_msg
    })


@app.route('/api/logs/system', methods=['GET'])
def get_system_logs():
    """
    Get system logs.
    
    Query params:
        time_period: Time range (default: 1h)
        limit: Max entries (default: 100)
    """
    time_period = request.args.get('time_period', '1h')
    limit = request.args.get('limit', type=int)
    
    try:
        parser = UnifiedLogParser(
            predicate='',
            log_type='system',
            time_period=time_period,
            limit=limit,
            style='syslog'
        )
        logs = parser.parse()
        
        return jsonify({
            "status": "success",
            "log_type": "system",
            "count": len(logs),
            "logs": logs
        })
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500


@app.route('/api/logs/kernel', methods=['GET'])
def get_kernel_logs():
    """Get kernel logs."""
    time_period = request.args.get('time_period', '1h')
    limit = request.args.get('limit', type=int)
    
    try:
        parser = UnifiedLogParser(
            predicate='process == "kernel"',
            log_type='kernel',
            time_period=time_period,
            limit=limit,
            style='syslog'
        )
        logs = parser.parse()
        
        return jsonify({
            "status": "success",
            "log_type": "kernel",
            "count": len(logs),
            "logs": logs
        })
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500


@app.route('/api/logs/auth', methods=['GET'])
def get_auth_logs():
    """
    Get authentication logs (loginwindow and sudo).
    
    Query params:
        time_period: Time range (default: 1h)
        limit: Max entries
    """
    time_period = request.args.get('time_period', '1h')
    limit = request.args.get('limit', type=int)
    
    try:
        parser = UnifiedLogParser(
            predicate='process == "loginwindow" OR process == "sudo"',
            log_type='auth',
            time_period=time_period,
            limit=limit,
            style='syslog'
        )
        logs = parser.parse()
        
        return jsonify({
            "status": "success",
            "log_type": "auth",
            "count": len(logs),
            "logs": logs
        })
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500


@app.route('/api/logs/hardware', methods=['GET'])
def get_hardware_logs():
    """
    Get hardware logs (via kernel logs filtered for hardware-related events).
    
    Note: Direct IOKit subsystem predicates may not return logs due to how
    macOS stores hardware events. This endpoint uses kernel logs which
    often contain hardware-related information.
    
    Query params:
        time_period: Time range (default: 1h)
        limit: Max entries
    """
    time_period = request.args.get('time_period', '1h')
    limit = request.args.get('limit', type=int)
    
    try:
        # Use kernel logs and filter for hardware-related keywords
        # Use a shorter time period and smaller limit to avoid timeouts
        # Hardware logs may be sparse, so we fetch more kernel logs to filter from
        if not limit:
            limit = 10
        fetch_limit = min(limit * 3, 30)  # Cap at 30 to avoid timeouts
        safe_time_period = '1h' if time_period in ['24h', '7d'] else time_period  # Use 1h for long periods
        
        parser = UnifiedLogParser(
            predicate='process == "kernel"',
            log_type='hardware',
            time_period=safe_time_period,
            limit=fetch_limit,
            style='syslog'
        )
        all_logs = parser.parse()
        
        # Filter for hardware-related keywords
        hardware_keywords = ['USB', 'storage', 'disk', 'device', 'IOKit', 'hardware', 'PCI', 'SATA', 'Thunderbolt']
        hardware_logs = []
        for log in all_logs:
            message = log.get('message', '').upper()
            if any(keyword.upper() in message for keyword in hardware_keywords):
                hardware_logs.append(log)
        
        # Apply limit after filtering
        if limit and len(hardware_logs) > limit:
            hardware_logs = hardware_logs[:limit]
        
        return jsonify({
            "status": "success",
            "log_type": "hardware",
            "count": len(hardware_logs),
            "logs": hardware_logs,
            "note": "Hardware logs are filtered from kernel logs using hardware-related keywords"
        })
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500


@app.route('/api/logs/power', methods=['GET'])
def get_power_logs():
    """
    Get power management logs.
    
    Query params:
        time_period: Time range (default: 1h)
        limit: Max entries
    """
    time_period = request.args.get('time_period', '1h')
    limit = request.args.get('limit', type=int)
    
    try:
        parser = UnifiedLogParser(
            predicate='subsystem contains "power"',
            log_type='power',
            time_period=time_period,
            limit=limit,
            style='syslog'
        )
        logs = parser.parse()
        
        return jsonify({
            "status": "success",
            "log_type": "power",
            "count": len(logs),
            "logs": logs
        })
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500


@app.route('/api/logs/scheduler', methods=['GET'])
def get_scheduler_logs():
    """
    Get scheduler/launchd logs.
    
    Query params:
        time_period: Time range (default: 1h)
        limit: Max entries
    """
    time_period = request.args.get('time_period', '1h')
    limit = request.args.get('limit', type=int)
    
    try:
        parser = UnifiedLogParser(
            predicate='process == "launchd"',
            log_type='scheduler',
            time_period=time_period,
            limit=limit,
            style='syslog'
        )
        logs = parser.parse()
        
        return jsonify({
            "status": "success",
            "log_type": "scheduler",
            "count": len(logs),
            "logs": logs
        })
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500


@app.route('/api/logs/boot', methods=['GET'])
def get_boot_logs():
    """
    Get boot logs.
    
    Note: Boot logs may be sparse and queries can be slow. Uses shorter time periods to avoid timeouts.
    
    Query params:
        time_period: Time range (default: 1h, max: 24h to avoid timeouts)
        limit: Max entries
    """
    time_period = request.args.get('time_period', '1h')
    limit = request.args.get('limit', type=int, default=50)
    
    try:
        # Limit time period to prevent timeouts with "contains" predicates
        # Boot logs with "contains" can be very slow
        safe_time_period = '1h'  # Keep it short to avoid timeouts
        if time_period in ['1h', '5m', '15m', '30m']:
            safe_time_period = time_period
        
        parser = UnifiedLogParser(
            predicate='eventMessage contains "boot"',
            log_type='boot',
            time_period=safe_time_period,
            limit=min(limit, 50) if limit else 50,  # Cap at 50 to avoid timeouts
            style='syslog'
        )
        logs = parser.parse()
        
        return jsonify({
            "status": "success",
            "log_type": "boot",
            "count": len(logs),
            "logs": logs,
            "note": "Boot logs are limited to 1h periods to avoid timeouts. Boot events may be sparse."
        })
    except Exception as e:
        error_msg = str(e)
        if "timed out" in error_msg:
            return jsonify({
                "status": "error",
                "message": "Boot log query timed out. Boot logs can be slow to query. Try shorter time periods or check system logs manually.",
                "suggestion": "Use 'log show --last 1h --predicate \"eventMessage contains boot\"' in terminal for faster results"
            }), 500
        return jsonify({
            "status": "error",
            "message": error_msg
        }), 500


@app.route('/api/logs/crashes', methods=['GET'])
def get_crash_logs():
    """
    Get crash logs from DiagnosticReports directories.
    
    Query params:
        limit: Max entries (default: 20)
    """
    limit = request.args.get('limit', type=int, default=20)
    
    try:
        parser = CrashLogParser(limit=limit)
        logs = parser.parse()
        
        return jsonify({
            "status": "success",
            "log_type": "crashes",
            "count": len(logs),
            "logs": logs
        })
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500


@app.route('/api/logs/packages', methods=['GET'])
def get_package_logs():
    """
    Get Homebrew/package manager logs.
    
    Query params:
        limit: Max entries (default: 50)
    """
    limit = request.args.get('limit', type=int, default=50)
    
    try:
        parser = PackageLogParser(limit=limit)
        logs = parser.parse()
        
        return jsonify({
            "status": "success",
            "log_type": "packages",
            "count": len(logs),
            "logs": logs
        })
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500


if __name__ == '__main__':
    # Run startup checks
    try:
        compatible, msg = check_macos_version()
        if not compatible:
            print(f"ERROR: {msg}")
            sys.exit(1)
        
        unified_ok, unified_msg = verify_unified_logging()
        if not unified_ok:
            print(f"ERROR: {unified_msg}")
            sys.exit(1)
        
        print("Starting macOS Log Analyzer API...")
        print(f"✓ {msg}")
        print(f"✓ {unified_msg}")
        app.run(debug=True, host='127.0.0.1', port=5000)
    except Exception as e:
        print(f"Fatal error: {e}")
        sys.exit(1)
