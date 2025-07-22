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
import { ChevronUp, ChevronDown, ExternalLink, Shield } from 'lucide-react';
import type { Risk } from '../../types';
import { RiskLevelBadge } from './RiskLevelBadge';
import { Badge } from '../ui/Badge';
import { cn } from '../../utils/cn';
import { Link } from 'react-router-dom';

interface RiskTableProps {
  risks: Risk[];
  searchTerm: string;
  selectedCategories: string[];
  selectedLevels: string[];
  onRowClick?: (risk: Risk) => void;
}

const columnHelper = createColumnHelper<Risk>();

const fuzzyFilter: FilterFn<Risk> = (row, columnId, value, addMeta) => {
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

export const RiskTable: React.FC<RiskTableProps> = ({
  risks,
  searchTerm,
  selectedCategories,
  selectedLevels,
  onRowClick
}) => {
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: 'initialRiskLevel', desc: true }
  ]);

  const filteredRisks = useMemo(() => {
    return risks.filter(risk => {
      if (selectedCategories.length > 0 && !selectedCategories.includes(risk.riskCategory)) {
        return false;
      }
      if (selectedLevels.length > 0 && !selectedLevels.includes(risk.residualScoring.riskLevelCategory)) {
        return false;
      }
      return true;
    });
  }, [risks, selectedCategories, selectedLevels]);

  const columns = useMemo<ColumnDef<Risk>[]>(
    () => [
      columnHelper.accessor('id', {
        header: 'Risk ID',
        cell: info => (
          <Link to={`/risks/${info.getValue()}`} className="text-accent hover:underline font-medium">
            {info.getValue().toUpperCase()}
          </Link>
        ),
        size: 100
      }),
      columnHelper.accessor('riskCategory', {
        header: 'Category',
        cell: info => (
          <Badge variant="default" className="text-xs">
            {info.getValue()}
          </Badge>
        ),
        size: 150
      }),
      columnHelper.accessor('risk', {
        header: 'Risk Name',
        cell: info => (
          <div className="max-w-md">
            <p className="text-sm font-medium text-slate-900 line-clamp-2">{info.getValue()}</p>
          </div>
        ),
        size: 300
      }),
      columnHelper.accessor(row => row.initialScoring.riskLevel, {
        id: 'initialRiskLevel',
        header: 'Initial Risk',
        cell: info => {
          const risk = info.row.original;
          return (
            <RiskLevelBadge 
              level={risk.initialScoring.riskLevelCategory} 
              score={risk.initialScoring.riskLevel}
            />
          );
        },
        size: 120
      }),
      columnHelper.accessor(row => row.residualScoring.riskLevel, {
        id: 'residualRiskLevel',
        header: 'Residual Risk',
        cell: info => {
          const risk = info.row.original;
          return (
            <RiskLevelBadge 
              level={risk.residualScoring.riskLevelCategory} 
              score={risk.residualScoring.riskLevel}
            />
          );
        },
        size: 120
      }),
      columnHelper.accessor(row => row.proposedOversightOwnership, {
        id: 'owners',
        header: 'Owners',
        cell: info => {
          const owners = info.getValue();
          if (owners.length === 0) {
            return <span className="text-sm text-slate-400">-</span>;
          }
          
          if (owners.length <= 2) {
            return (
              <div className="flex flex-wrap gap-1">
                {owners.map((owner: string, idx: number) => (
                  <Badge key={idx} variant="secondary" className="text-xs">
                    {owner}
                  </Badge>
                ))}
              </div>
            );
          }
          
          return (
            <div className="flex items-center gap-1">
              <Badge variant="secondary" className="text-xs">
                {owners[0]}
              </Badge>
              <span className="text-xs text-slate-500">
                +{owners.length - 1} more
              </span>
            </div>
          );
        },
        size: 150
      }),
      columnHelper.accessor(row => row.relatedControlIds.length, {
        id: 'controlCount',
        header: 'Controls',
        cell: info => {
          const count = info.getValue();
          return (
            <div className="flex items-center space-x-2">
              <Shield className={cn(
                "h-4 w-4",
                count > 0 ? "text-accent" : "text-slate-400"
              )} />
              <span className={cn(
                "text-sm font-medium",
                count > 0 ? "text-slate-900" : "text-slate-400"
              )}>
                {count}
              </span>
            </div>
          );
        },
        size: 100
      }),
      columnHelper.accessor('mitigationEffectiveness', {
        header: 'Mitigation',
        cell: info => {
          const effectiveness = info.getValue();
          const variant = effectiveness === 'High' ? 'success' : 
                          effectiveness === 'Medium' ? 'warning' : 
                          effectiveness === 'Low' ? 'danger' : 'default';
          return (
            <Badge variant={variant}>
              {effectiveness}
            </Badge>
          );
        },
        size: 120
      }),
      columnHelper.display({
        id: 'actions',
        header: 'Actions',
        cell: info => (
          <div className="flex items-center space-x-2">
            <Link 
              to={`/risks/${info.row.original.id}`}
              className="text-slate-500 hover:text-slate-700 transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
            </Link>
          </div>
        ),
        size: 80
      })
    ],
    []
  );

  const table = useReactTable({
    data: filteredRisks,
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
    <div className="overflow-x-auto bg-white shadow ring-1 ring-black ring-opacity-5 rounded-md">
      <table className="min-w-full divide-y divide-slate-300">
        <thead className="bg-slate-50">
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <th
                  key={header.id}
                  className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
                  style={{ width: header.getSize() }}
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
            <tr 
              key={row.id} 
              className="hover:bg-slate-50 cursor-pointer transition-colors"
              onClick={() => onRowClick?.(row.original)}
            >
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
          <p className="text-slate-500">No risks found matching your criteria.</p>
        </div>
      )}
    </div>
  );
};