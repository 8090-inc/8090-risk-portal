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
import { ChevronUp, ChevronDown, ExternalLink } from 'lucide-react';
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

const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value);
  addMeta({ itemRank });
  return itemRank.passed;
};

const rankItem = (rowValue: any, searchValue: string) => {
  const value = String(rowValue).toLowerCase();
  const search = searchValue.toLowerCase();
  const passed = value.includes(search);

  return { passed, score: passed ? 0 : -1 };
};

export const ControlsTable: React.FC<ControlsTableProps> = ({
  controls,
  searchTerm,
  selectedCategories,
  selectedStatuses
}) => {
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const filteredControls = useMemo(() => {
    return controls.filter(control => {
      if (selectedCategories.length > 0 && !selectedCategories.includes(control.category)) {
        return false;
      }
      if (selectedStatuses.length > 0 && !selectedStatuses.includes(control.implementationStatus || 'Not Implemented')) {
        return false;
      }
      return true;
    });
  }, [controls, selectedCategories, selectedStatuses]);

  const columns = useMemo<ColumnDef<Control, any>[]>(
    () => [
      columnHelper.accessor('mitigationID', {
        header: 'Control ID',
        cell: info => (
          <Link to={`/controls/${info.getValue()}`} className="text-accent hover:underline font-medium">
            {info.getValue().toUpperCase()}
          </Link>
        )
      }),
      columnHelper.accessor('mitigationDescription', {
        header: 'Description',
        cell: info => (
          <div className="max-w-xl">
            <p className="text-sm text-slate-900 line-clamp-2">{info.getValue()}</p>
          </div>
        )
      }),
      columnHelper.accessor('category', {
        header: 'Category',
        cell: info => (
          <Badge variant="default" className="text-xs">
            {info.getValue()}
          </Badge>
        )
      }),
      columnHelper.accessor('implementationStatus', {
        header: 'Status',
        cell: info => {
          const status = info.getValue() || 'Not Implemented';
          const variant = status === 'Implemented' ? 'success' : 
                          status === 'In Progress' ? 'warning' : 'default';
          return (
            <Badge variant={variant}>
              {status}
            </Badge>
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
            <div className="flex items-center space-x-2">
              <div className="w-24 bg-slate-200 rounded-full h-2">
                <div 
                  className={cn(
                    "h-2 rounded-full transition-all",
                    percentage >= 80 ? "bg-green-500" :
                    percentage >= 60 ? "bg-yellow-500" :
                    percentage >= 40 ? "bg-orange-500" : "bg-red-500"
                  )}
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="text-sm font-medium text-slate-700">{percentage}%</span>
            </div>
          );
        }
      }),
      columnHelper.display({
        id: 'actions',
        header: 'Actions',
        cell: info => (
          <div className="flex items-center space-x-2">
            <Link 
              to={`/controls/${info.row.original.mitigationID}`}
              className="text-slate-500 hover:text-slate-700 transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
            </Link>
          </div>
        )
      })
    ],
    []
  );

  const table = useReactTable({
    data: filteredControls,
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
    <div className="overflow-hidden bg-white shadow ring-1 ring-black ring-opacity-5 rounded-md">
      <table className="min-w-full divide-y divide-slate-300">
        <thead className="bg-slate-50">
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <th
                  key={header.id}
                  className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
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
        <tbody className="bg-white divide-y divide-slate-200">
          {table.getRowModel().rows.map(row => (
            <tr key={row.id} className="hover:bg-slate-50 transition-colors">
              {row.getVisibleCells().map(cell => (
                <td key={cell.id} className="px-6 py-4 whitespace-nowrap text-sm">
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
  );
};