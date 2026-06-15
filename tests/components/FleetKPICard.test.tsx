import { render, screen } from '@testing-library/react';
import { FleetKPICard } from '@/components/admin/FleetKPICard';

it('renders label and value', () => {
  render(<FleetKPICard label="Running VMs" value="18" sub="of 24 total" />);
  expect(screen.getByText('Running VMs')).toBeInTheDocument();
  expect(screen.getByText('18')).toBeInTheDocument();
  expect(screen.getByText('of 24 total')).toBeInTheDocument();
});

it('applies text-admin-accent class when accent is true', () => {
  const { container } = render(<FleetKPICard label="Running VMs" value="18" accent />);
  const valueEl = container.querySelector('p:nth-child(2)');
  expect(valueEl?.className).toContain('text-admin-accent');
});

it('applies text-foreground class when accent is false', () => {
  const { container } = render(<FleetKPICard label="Running VMs" value="18" />);
  const valueEl = container.querySelector('p:nth-child(2)');
  expect(valueEl?.className).toContain('text-foreground');
});

it('does not render sub text when sub is omitted', () => {
  const { queryByText } = render(<FleetKPICard label="Test" value="5" />);
  expect(queryByText('of 24 total')).not.toBeInTheDocument();
});
