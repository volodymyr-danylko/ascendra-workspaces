import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db, generateFleetMetrics, delay } from '@/lib/mock-data';

export async function GET(req: Request) {
  await delay();
  const cookieStore = await cookies();
  if (!cookieStore.get('userId')?.value) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const hours = Number(new URL(req.url).searchParams.get('hours') ?? '24');
  const vms = db.getAllVMs();
  const running = vms.filter((v) => v.status === 'running');
  const stopped = vms.filter((v) => v.status === 'stopped');
  const avgCpu = running.length
    ? running.reduce((s, v) => s + v.cpuUsagePercent, 0) / running.length
    : 0;
  const avgMem = running.length
    ? running.reduce((s, v) => s + v.memoryUsagePercent, 0) / running.length
    : 0;
  const totalHourlyCost = running.reduce((s, v) => s + v.hourlyCost, 0);
  const daysElapsed = new Date().getDate();
  const monthToDateCost = totalHourlyCost * 24 * daysElapsed;

  return NextResponse.json({
    fleet: {
      period: `last-${hours}-hours`,
      totalVms: vms.length,
      runningVms: running.length,
      stoppedVms: stopped.length,
      totalUsers: new Set(vms.map((v) => v.ownerId)).size,
      avgCpuUtilizationPercent: Math.round(avgCpu),
      peakCpuUtilizationPercent: Math.round(avgCpu * 1.4),
      avgMemoryUtilizationPercent: Math.round(avgMem),
      peakMemoryUtilizationPercent: Math.round(avgMem * 1.3),
      totalHourlyCost,
      monthToDateCost,
      projectedMonthlyCost: totalHourlyCost * 24 * 30,
      utilizationTrend: generateFleetMetrics(hours),
      vmMetrics: vms.map((v) => ({
        vmId: v.id,
        cpuPercent: v.cpuUsagePercent,
        memoryPercent: v.memoryUsagePercent,
        diskPercent: v.diskUsagePercent,
        status: v.status,
      })),
    },
  });
}
