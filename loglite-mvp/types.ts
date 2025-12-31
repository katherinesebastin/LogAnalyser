export interface BaseLog {
  timestamp: string;
  [key: string]: any;
}

export interface SystemLog extends BaseLog {
  hostname: string;
  process: string;
  pid: number;
  level: string;
  message: string;
}

export interface NetworkLog extends BaseLog {
  source_ip: string;
  dest_ip: string;
  source_port?: number;
  dest_port?: number;
  protocol?: string;
  action?: string;
  rule_id?: number;
  interface?: string;
  query_type?: string;
  domain?: string;
  severity?: number;
  alert_type?: string;
}

export interface ServerLog extends BaseLog {
  source: string;
  client_ip?: string;
  method?: string;
  path?: string;
  status_code?: number;
  bytes?: number;
  user_agent?: string;
  database_name?: string;
  query_type?: string;
  query_duration?: string;
  table_name?: string;
}

export interface ApiResponse<T> {
  status: string;
  log_type: string;
  count: number;
  logs: T[];
  note?: string;
}

export interface SecurityStats {
  failed_logins: number;
  firewall_blocks: number;
  ids_alerts: number;
  suspicious_ips: string[];
  threat_level: string;
}

export type LogCategory = 'system' | 'network' | 'server';
