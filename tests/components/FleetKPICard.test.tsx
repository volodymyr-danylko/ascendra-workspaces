import { render, screen } from '@testing-library/react';
import { FleetKPICard } from '@/components/admin/FleetKPICard';

it('renders label and value', () => {
  render(<FleetKPICard label="Running VMs" value="18" sub="of 24 total" />);
  expect(screen.getByText('Running VMs')).toBeInTheDocument();
  expect(screen.getByText('18')).toBeInTheDocument();
  expect(screen.getByText('of 24 total')).toBeInTheDocument();
});
