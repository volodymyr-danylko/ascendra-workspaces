import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { VMCard } from '@/components/developer/VMCard';
import type { VM } from '@/types';

const mockVM: VM = {
  id: 'vm1', name: 'dev-machine-01', ownerId: 'u1', templateId: 't2',
  status: 'running', region: 'us-east-1', createdAt: '2025-01-01T00:00:00Z',
  startedAt: new Date(Date.now() - 3_600_000).toISOString(),
  lastActiveAt: new Date().toISOString(),
  cpuUsagePercent: 42, memoryUsagePercent: 67, diskUsagePercent: 31, hourlyCost: 0.48,
};

it('renders VM name and status', () => {
  render(<VMCard vm={mockVM} onAction={vi.fn()} isActioning={false} />);
  expect(screen.getByText('dev-machine-01')).toBeInTheDocument();
  expect(screen.getByText('running')).toBeInTheDocument();
});

it('renders resource usage', () => {
  render(<VMCard vm={mockVM} onAction={vi.fn()} isActioning={false} />);
  expect(screen.getByText('42%')).toBeInTheDocument();
  expect(screen.getByText('67%')).toBeInTheDocument();
});

it('calls onAction with "stop" when Stop is clicked', async () => {
  const onAction = vi.fn();
  render(<VMCard vm={mockVM} onAction={onAction} isActioning={false} />);
  await userEvent.click(screen.getByRole('button', { name: /stop/i }));
  expect(onAction).toHaveBeenCalledWith('stop');
});
