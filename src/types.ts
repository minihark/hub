export type AppCategory = 'all' | 'finance' | 'craft' | 'crypto' | 'tools';

export interface HarkcoApp {
  id: string;
  name: string;
  tagline: string;
  description: string;
  url: string;
  category: AppCategory;
  categoryLabel: string;
  themeColor: string;
  accentBg: string;
  badge: string;
  iconName: string;
  features: string[];
  monetization: string;
  yearLaunched: string;
  githubUrl?: string;
}

export interface ChangelogEntry {
  id: string;
  date: string;
  title: string;
  appId: string;
  appName: string;
  appUrl: string;
  category: 'launch' | 'redesign' | 'feature' | 'milestone';
  version: string;
  summary: string;
  highlights: string[];
  author: string;
}

export interface MonitorTelemetry {
  id: string;
  name: string;
  url: string;
  status: 'up' | 'degraded' | 'down';
  latency: number;
  uptime24h?: number;
}

export interface FleetResponse {
  status: string;
  fleet_status: 'all_operational' | 'degraded';
  last_updated: string;
  monitors: MonitorTelemetry[];
}
