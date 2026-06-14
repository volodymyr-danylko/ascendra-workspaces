export type VMStatus = 'running' | 'stopped' | 'starting' | 'stopping' | 'error';

export interface VM {
  id: string;
  name: string;
  ownerId: string;
  templateId: string;
  status: VMStatus;
  region: string;
  createdAt: string;
  startedAt: string | null;
  lastActiveAt: string;
  cpuUsagePercent: number;
  memoryUsagePercent: number;
  diskUsagePercent: number;
  hourlyCost: number;
}

export interface VMTemplate {
  id: string;
  name: string;
  description: string;
  baseImage: string;
  vCpu: number;
  memoryGb: number;
  diskSizeGb: number;
  preinstalledTools: string[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'engineer' | 'admin';
  vmCount: number;
}

export interface MetricPoint {
  timestamp: string;
  cpuPercent: number;
  memoryPercent: number;
}

export interface FleetMetricPoint extends MetricPoint {
  runningVms: number;
}

export interface FleetUtilization {
  period: string;
  totalVms: number;
  runningVms: number;
  stoppedVms: number;
  totalUsers: number;
  avgCpuUtilizationPercent: number;
  peakCpuUtilizationPercent: number;
  avgMemoryUtilizationPercent: number;
  peakMemoryUtilizationPercent: number;
  totalHourlyCost: number;
  monthToDateCost: number;
  projectedMonthlyCost: number;
  utilizationTrend: FleetMetricPoint[];
  vmMetrics: {
    vmId: string;
    cpuPercent: number;
    memoryPercent: number;
    diskPercent: number;
    status: VMStatus;
  }[];
}
