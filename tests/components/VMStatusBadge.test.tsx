import { render, screen } from '@testing-library/react';
import { VMStatusBadge } from '@/components/developer/VMStatusBadge';

it('shows "running" label for running status', () => {
  render(<VMStatusBadge status="running" />);
  expect(screen.getByText('running')).toBeInTheDocument();
});

it('shows "starting" with animate-pulse class for starting status', () => {
  const { container } = render(<VMStatusBadge status="starting" />);
  expect(container.firstChild).toHaveClass('animate-pulse');
});

it('shows "stopped" label for stopped status', () => {
  render(<VMStatusBadge status="stopped" />);
  expect(screen.getByText('stopped')).toBeInTheDocument();
});
