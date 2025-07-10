import React from 'react';
import { render, screen } from '@testing-library/react';
import { DataStatus } from '../DataStatus';

describe('DataStatus Component', () => {
  it('renders without crashing', () => {
    render(<DataStatus />);
    expect(screen.getByText('Data Status')).toBeInTheDocument();
  });

  it('displays record counts when provided', () => {
    render(
      <DataStatus 
        recordCount={{ risks: 32, controls: 18 }}
      />
    );
    
    expect(screen.getByText(/32/)).toBeInTheDocument();
    expect(screen.getByText(/risks/)).toBeInTheDocument();
    expect(screen.getByText(/18/)).toBeInTheDocument();
    expect(screen.getByText(/controls/)).toBeInTheDocument();
  });

  it('shows "Never" when no lastUpdated provided', () => {
    render(<DataStatus />);
    expect(screen.getByText('Never')).toBeInTheDocument();
  });

  it('shows relative time for recent updates', () => {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    render(<DataStatus lastUpdated={fiveMinutesAgo} />);
    expect(screen.getByText(/5 minutes ago/)).toBeInTheDocument();
  });

  it('displays validation status correctly', () => {
    render(<DataStatus validationStatus="valid" />);
    expect(screen.getByText('Data Valid')).toBeInTheDocument();
  });
});