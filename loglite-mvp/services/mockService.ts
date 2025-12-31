import { ApiResponse, SystemLog, NetworkLog, ServerLog, SecurityStats } from '../types';

// Utilities
const generateTimestamp = () => new Date(Date.now() - Math.floor(Math.random() * 86400000)).toISOString();
const randomIP = () => `192.168.${Math.floor(Math.random() * 5)}.${Math.floor(Math.random() * 254) + 1}`;
const randomExtIP = () => `${Math.floor(Math.random() * 200)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;

// --- System Log Generator ---
const generateSystemLogs = (count: number, type: string): SystemLog[] => {
  const t = type.toLowerCase();
  let processes = ['kernel', 'launchd'];
  let messages = ['Service started'];
  const levels = ['DEFAULT', 'INFO', 'ERROR', 'FAULT', 'DEBUG'];
  
  if (t.includes('kernel')) {
    processes = ['kernel', 'Sandbox', 'AppleACPICPU', 'IOBluetooth'];
    messages = ['VoodooPS2Trackpad: Identify TouchPad', 'disk0s2: I/O error', 'ARPT: 64.512630: AirPort_Brcm4360', 'Wake reason: XHC1'];
  } else if (t.includes('auth')) {
    processes = ['loginwindow', 'sudo', 'SecurityAgent', 'coreauthd'];
    messages = ['Login successful for user admin', 'FAILED LOGIN (3) from 192.168.1.105', 'sudo: pam_authenticate: Conversation error', 'Lid closed, locking user session'];
  } else if (t.includes('hardware')) {
    processes = ['thermalmonitord', 'kernel', 'IOUSBHost'];
    messages = ['CPU Thermal level: 50', 'USB Device Attached: Keyboard', 'Fan speed: 1200rpm', 'Battery health: 89%'];
  } else if (t.includes('power')) {
    processes = ['powerd', 'pmset'];
    messages = ['Entering Sleep state', 'Wake from Standby', 'DarkWake from Deep Idle', 'Battery level below 20%'];
  } else if (t.includes('scheduler')) {
    processes = ['launchd', 'cron', 'taskgated'];
    messages = ['Job com.apple.backupd started', 'Removed job com.google.updater', 'Overdue job skipped', 'XPC connection invalidated'];
  } else if (t.includes('boot')) {
    processes = ['bootes', 'kernel', 'launchd'];
    messages = ['Darwin Kernel Version 21.6.0', 'Root volume mounted read-only', 'System uptime: 0:00:15', 'Launchd started'];
  } else if (t.includes('crash')) {
    processes = ['ReportCrash', 'WindowServer', 'Chrome'];
    messages = ['Segmentation fault: 11', 'Process 501 terminated unexpectedly', 'Generating crash report for PID 442', 'GPU Reset triggered'];
  } else if (t.includes('package')) {
    processes = ['installd', 'softwareupdate', 'pkgutil'];
    messages = ['Installed "Xcode Command Line Tools"', 'Downloading update: macOS 14.2', 'Verifying package signature', 'Package verification failed'];
  } else {
    // Default system logs
    processes = ['kernel', 'launchd', 'WindowServer', 'bluetoothd', 'wifi-agent', 'mDNSResponder'];
    messages = ['Connection established', 'Process started', 'Memory warning', 'Disk usage high', 'User authentication failed'];
  }

  return Array.from({ length: count }).map(() => ({
    timestamp: generateTimestamp(),
    hostname: 'macbook-pro.local',
    process: processes[Math.floor(Math.random() * processes.length)],
    pid: Math.floor(Math.random() * 30000) + 100,
    level: levels[Math.floor(Math.random() * levels.length)],
    message: messages[Math.floor(Math.random() * messages.length)] + ` [ID: ${Math.floor(Math.random() * 9999)}]`
  }));
};

// --- Network Log Generator ---
const generateNetworkLogs = (count: number, type: string): NetworkLog[] => {
  const t = type.toLowerCase();
  
  return Array.from({ length: count }).map(() => {
    const base = {
      timestamp: generateTimestamp(),
      source_ip: Math.random() > 0.5 ? randomIP() : randomExtIP(),
      dest_ip: Math.random() > 0.5 ? randomIP() : randomExtIP(),
      source_port: Math.floor(Math.random() * 60000) + 1024,
      dest_port: 80,
      protocol: 'TCP',
    };

    if (t.includes('firewall')) {
      return {
        ...base,
        action: ['ALLOW', 'DENY', 'DROP', 'REJECT'][Math.floor(Math.random() * 4)],
        protocol: ['TCP', 'UDP', 'ICMP'][Math.floor(Math.random() * 3)],
        rule_id: Math.floor(Math.random() * 100),
        info: 'Matched default rule'
      };
    } else if (t.includes('dns')) {
      const domains = ['google.com', 'api.loglite.com', 'cdn.reactjs.org', 'malware-site.net', 'facebook.com'];
      return {
        ...base,
        dest_port: 53,
        protocol: 'UDP',
        query_type: ['A', 'AAAA', 'CNAME', 'MX'][Math.floor(Math.random() * 4)],
        domain: domains[Math.floor(Math.random() * domains.length)],
        info: `Response: ${randomExtIP()}`
      };
    } else if (t.includes('dhcp')) {
      const msgs = ['DHCPDISCOVER', 'DHCPOFFER', 'DHCPREQUEST', 'DHCPACK'];
      return {
        ...base,
        protocol: 'UDP',
        source_port: 68,
        dest_port: 67,
        info: `${msgs[Math.floor(Math.random() * msgs.length)]} on eth0`
      };
    } else if (t.includes('vpn')) {
      return {
        ...base,
        protocol: 'IKEv2',
        dest_port: 500,
        info: ['Tunnel Established', 'Handshake Failed', 'Rekeying', 'User Disconnected'][Math.floor(Math.random() * 4)],
        action: 'CONNECT'
      };
    } else if (t.includes('proxy')) {
      return {
        ...base,
        protocol: 'HTTP/HTTPS',
        dest_port: 8080,
        action: ['CACHE_HIT', 'CACHE_MISS', 'DENIED'][Math.floor(Math.random() * 3)],
        info: `GET http://example.com/asset-${Math.floor(Math.random() * 50)}.jpg`
      };
    } else if (t.includes('ids') || t.includes('alert')) {
      const alerts = ['SQL Injection Attempt', 'Port Scan Detected', 'Malicious Payload', 'XSS Attack', 'Brute Force Attempt'];
      return {
        ...base,
        severity: Math.floor(Math.random() * 10),
        alert_type: alerts[Math.floor(Math.random() * alerts.length)],
        protocol: 'TCP',
        action: 'ALERT',
        info: 'Signature ID: 40221'
      };
    }

    // Default Fallback
    return { ...base, protocol: 'TCP', action: 'ALLOW', info: 'Packet forwarded' };
  });
};

// --- Server Log Generator ---
const generateServerLogs = (count: number, type: string): ServerLog[] => {
  const t = type.toLowerCase();
  
  return Array.from({ length: count }).map(() => {
    const base = {
      timestamp: generateTimestamp(),
      source: 'server-node-01',
    };

    if (t.includes('web')) {
        const methods = ['GET', 'POST', 'PUT', 'DELETE'];
        const statuses = [200, 201, 301, 304, 400, 401, 403, 404, 500];
        return {
            ...base,
            source: 'nginx-access',
            client_ip: randomExtIP(),
            method: methods[Math.floor(Math.random() * methods.length)],
            path: ['/api/users', '/login', '/dashboard', '/assets/style.css', '/favicon.ico'][Math.floor(Math.random() * 5)],
            status_code: statuses[Math.floor(Math.random() * statuses.length)],
            user_agent: 'Mozilla/5.0 ...'
        };
    } else if (t.includes('app')) {
        return {
            ...base,
            source: 'app-server',
            level: ['INFO', 'WARN', 'ERROR'][Math.floor(Math.random() * 3)],
            message: ['Garbage collection started', 'User session expired', 'Payment gateway timeout', 'Cache invalidated'][Math.floor(Math.random() * 4)],
            file: `src/services/${['auth', 'payment', 'user', 'logger'][Math.floor(Math.random() * 4)]}.ts`
        };
    } else if (t.includes('database')) {
        const queries = ['SELECT * FROM users', 'UPDATE orders SET status', 'INSERT INTO logs', 'DELETE FROM sessions'];
        return {
            ...base,
            source: 'postgres',
            query_type: ['SELECT', 'UPDATE', 'INSERT', 'DELETE'][Math.floor(Math.random() * 4)],
            query_duration: (Math.random() * 1000).toFixed(2) + 'ms',
            table_name: ['users', 'orders', 'products', 'audit_logs'][Math.floor(Math.random() * 4)],
            info: queries[Math.floor(Math.random() * queries.length)]
        };
    } else if (t.includes('mail')) {
        return {
            ...base,
            source: 'postfix',
            method: 'SMTP',
            status: ['SENT', 'QUEUED', 'BOUNCED', 'REJECTED'][Math.floor(Math.random() * 4)],
            recipient: `user${Math.floor(Math.random() * 100)}@example.com`,
            info: 'Message ID: <2023.A34F@mail.server.com>'
        };
    } else if (t.includes('ftp')) {
        const commands = ['USER', 'PASS', 'CWD', 'RETR', 'STOR', 'LIST'];
        return {
            ...base,
            source: 'vsftpd',
            command: commands[Math.floor(Math.random() * commands.length)],
            client_ip: randomExtIP(),
            status: [230, 226, 550, 331][Math.floor(Math.random() * 4)],
            file: '/var/www/uploads/image.png'
        };
    }

    return { ...base, source: 'generic', message: 'Log entry' };
  });
};

// Mock API Export
export const mockApi = {
  health: async () => ({ status: 'healthy (mock)' }),
  
  logs: {
    system: async (type: string, limit = 50): Promise<ApiResponse<SystemLog>> => ({
      status: 'success',
      log_type: type,
      count: limit,
      logs: generateSystemLogs(limit, type)
    }),
    network: async (type: string, limit = 50): Promise<ApiResponse<NetworkLog>> => ({
      status: 'success',
      log_type: type,
      count: limit,
      logs: generateNetworkLogs(limit, type)
    }),
    server: async (type: string, limit = 50): Promise<ApiResponse<ServerLog>> => ({
      status: 'success',
      log_type: type,
      count: limit,
      logs: generateServerLogs(limit, type)
    }),
  },

  stats: {
    security: async (): Promise<SecurityStats> => ({
      failed_logins: Math.floor(Math.random() * 50),
      firewall_blocks: Math.floor(Math.random() * 200),
      ids_alerts: Math.floor(Math.random() * 15),
      suspicious_ips: [randomExtIP(), randomExtIP(), randomExtIP()],
      threat_level: ['Low', 'Medium', 'High', 'Critical'][Math.floor(Math.random() * 4)]
    }),
  }
};