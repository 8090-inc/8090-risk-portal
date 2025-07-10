import React from 'react';
import { Select } from '../ui/Select';

type ImplementationStatus = 'Implemented' | 'In Progress' | 'Planned' | 'Not Started';

interface StatusFilterProps {
  selectedStatuses: Array<ImplementationStatus | undefined>;
  onStatusChange: (statuses: Array<ImplementationStatus | undefined>) => void;
}

const statusOptions = [
  { value: 'Implemented', label: 'Implemented' },
  { value: 'In Progress', label: 'In Progress' },
  { value: 'Planned', label: 'Planned' },
  { value: 'Not Started', label: 'Not Started' }
];

export const StatusFilter: React.FC<StatusFilterProps> = ({
  selectedStatuses,
  onStatusChange
}) => {
  return (
    <div className="w-64">
      <Select
        label="Filter by Status"
        placeholder="All statuses"
        options={statusOptions}
        value={selectedStatuses.filter(s => s !== undefined) as string[]}
        onChange={(value) => onStatusChange(value as Array<ImplementationStatus>)}
        multiple
      />
    </div>
  );
};