import React, { useMemo } from 'react';
import { 
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  getFilteredRowModel,
  type ColumnDef,
  type SortingState,
  type FilterFn
} from '@tanstack/react-table';
import { ChevronUp, ChevronDown, ArrowRight } from 'lucide-react';
import type { Control } from '../../types';
import { Badge } from '../ui/Badge';
import { cn } from '../../utils/cn';
import { Link } from 'react-router-dom';

interface ControlsTableProps {
  controls: Control[];
  searchTerm: string;
  selectedCategories: string[];
  selectedStatuses: string[];
}

const columnHelper = createColumnHelper<Control>();

const fuzzyFilter: FilterFn<Control> = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value);
  addMeta({ itemRank });
  return itemRank.passed;
};

const rankItem = (rowValue: unknown, searchValue: string) => {
  const value = String(rowValue).toLowerCase();
  const search = searchValue.toLowerCase();
  const passed = value.includes(search);

  return { passed, score: passed ? 0 : -1 };
};

export const ControlsTable: React.FC<ControlsTableProps> = ({
  controls,
  searchTerm
}) => {
  const [sorting, setSorting] = React.useState<SortingState>([]);

  // Remove double filtering - controls are already filtered by parent component
  console.log('ControlsTable: Received controls:', controls.length);

  const columns = useMemo<ColumnDef<Control>[]>(
    () => [
      columnHelper.accessor('mitigationID', {
        header: 'Control ID',
        cell: info => (
          <Link to={`/controls/${info.getValue()}`} className="text-accent hover:text-accent-700 font-semibold text-sm">
            {info.getValue().toUpperCase()}
          </Link>
        )
      }),
      columnHelper.accessor('mitigationDescription', {
        header: 'Description',
        cell: info => (
          <div className="max-w-xs lg:max-w-xl">
            <p className="text-sm text-slate-900 line-clamp-2">{info.getValue()}</p>
          </div>
        )
      }),
      columnHelper.accessor('category', {
        header: 'Category',
        cell: info => (
          <Badge variant="default" className="text-sm font-medium bg-slate-100 text-slate-700 border-slate-200">
            {info.getValue()}
          </Badge>
        )
      }),
      columnHelper.accessor('implementationStatus', {
        header: 'Status',
        cell: info => {
          const status = info.getValue() || 'Not Started';
          const statusConfig = {
            'Implemented': { bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-500' },
            'In Progress': { bg: 'bg-yellow-100', text: 'text-yellow-700', dot: 'bg-yellow-500' },
            'Planned': { bg: 'bg-blue-100', text: 'text-blue-700', dot: 'bg-blue-500' },
            'Not Started': { bg: 'bg-slate-100', text: 'text-slate-600', dot: 'bg-slate-400' }
          };
          const config = statusConfig[status] || statusConfig['Not Started'];
          
          return (
            <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md ${config.bg}`}>
              <div className={`w-2 h-2 rounded-full ${config.dot}`} />
              <span className={`text-sm font-medium ${config.text}`}>
                {status}
              </span>
            </div>
          );
        }
      }),
      columnHelper.accessor(row => row.complianceScore || 0, {
        id: 'complianceScore',
        header: 'Compliance',
        cell: info => {
          const score = info.getValue();
          const percentage = Math.round(score * 100);
          return (
            <div className="flex items-center gap-2">
              <div className="relative w-20 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div 
                  className={cn(
                    "absolute inset-y-0 left-0 rounded-full transition-all duration-500",
                    percentage >= 80 ? "bg-green-500" :
                    percentage >= 60 ? "bg-yellow-500" :
                    percentage >= 40 ? "bg-orange-500" : "bg-red-500"
                  )}
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className={cn(
                "text-xs font-semibold tabular-nums",
                percentage >= 80 ? "text-green-700" :
                percentage >= 60 ? "text-yellow-700" :
                percentage >= 40 ? "text-orange-700" : "text-red-700"
              )}>
                {percentage}%
              </span>
            </div>
          );
        }
      }),
      columnHelper.display({
        id: 'actions',
        header: 'Actions',
        cell: info => (
          <Link 
            to={`/controls/${info.row.original.mitigationID}`}
            className="inline-flex items-center justify-center w-8 h-8 rounded-md text-slate-500 hover:text-accent hover:bg-blue-50 transition-all group"
          >
            <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        )
      })
    ],
    []
  );

  const table = useReactTable({
    data: controls, // Use controls directly, not filteredControls
    columns,
    state: {
      sorting,
      globalFilter: searchTerm
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: fuzzyFilter
  });

  return (
    <div className="w-full">
      <div className="overflow-x-auto bg-white shadow-sm ring-1 ring-slate-200 rounded-lg">
        <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-gradient-to-b from-slate-50 to-slate-100/50">
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <th
                  key={header.id}
                  className="px-4 py-2.5 text-left text-sm font-medium text-slate-700"
                >
                  {header.isPlaceholder ? null : (
                    <div
                      className={cn(
                        "flex items-center space-x-1",
                        header.column.getCanSort() && "cursor-pointer select-none"
                      )}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <span>
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                      </span>
                      {header.column.getCanSort() && (
                        <span className="ml-2 flex-none">
                          {{
                            asc: <ChevronUp className="h-3 w-3" />,
                            desc: <ChevronDown className="h-3 w-3" />
                          }[header.column.getIsSorted() as string] ?? (
                            <div className="h-3 w-3" />
                          )}
                        </span>
                      )}
                    </div>
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="bg-white divide-y divide-slate-100">
          {table.getRowModel().rows.map(row => (
            <tr key={row.id} className="hover:bg-blue-50/50 transition-all duration-150 group">
              {row.getVisibleCells().map(cell => (
                <td key={cell.id} className="px-4 py-3 text-sm">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {table.getRowModel().rows.length === 0 && (
        <div className="text-center py-8">
          <p className="text-slate-500">No controls found matching your criteria.</p>
        </div>
      )}
      </div>
    </div>
  );
};