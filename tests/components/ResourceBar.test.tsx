import { render } from '@testing-library/react';
import { ResourceBar } from '@/components/developer/ResourceBar';

it('renders bar with correct width percentage', () => {
  const { container } = render(<ResourceBar value={42} label="CPU" />);
  const bar = container.querySelector('[style*="42%"]');
  expect(bar).toBeTruthy();
});

it('applies warning color when value > 80', () => {
  const { container } = render(<ResourceBar value={85} label="MEM" />);
  const bar = container.querySelector('[style*="85%"]');
  expect(bar?.className).toContain('bg-amber');
});

it('applies error color when value > 90', () => {
  const { container } = render(<ResourceBar value={95} label="DISK" />);
  const bar = container.querySelector('[style*="95%"]');
  expect(bar?.className).toContain('bg-status-error');
});
