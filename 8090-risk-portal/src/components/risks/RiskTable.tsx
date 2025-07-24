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
import { ChevronUp, ChevronDown, Shield, ArrowRight } from 'lucide-react';
import type { Risk } from '../../types';
import { RiskLevelBadge } from './RiskLevelBadge';
import { Badge } from '../ui/Badge';
import { cn } from '../../utils/cn';
import { Link } from 'react-router-dom';
import { useControlStore } from '../../store';

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
  const { controls } = useControlStore();
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
          <Link to={`/risks/${info.getValue()}`} className="text-accent hover:text-accent-700 font-semibold text-sm">
            {info.getValue().toUpperCase()}
          </Link>
        ),
        size: 100
      }),
      columnHelper.accessor('riskCategory', {
        header: 'Category',
        cell: info => (
          <Badge variant="default" className="text-sm font-medium bg-slate-100 text-slate-700 border-slate-200">
            {info.getValue()}
          </Badge>
        ),
        size: 150
      }),
      columnHelper.accessor('risk', {
        header: 'Risk Name',
        cell: info => (
          <div className="max-w-xs lg:max-w-md">
            <p className="text-sm font-medium text-slate-900 line-clamp-2 leading-snug group-hover:text-slate-950 transition-colors">{info.getValue()}</p>
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
            <div className="flex items-center gap-2">
              <RiskLevelBadge 
                level={risk.initialScoring.riskLevelCategory} 
                score={risk.initialScoring.riskLevel}
                showScore={false}
              />
              <span className="text-xs font-semibold text-slate-600">{risk.initialScoring.riskLevel}</span>
            </div>
          );
        },
        size: 120
      }),
      columnHelper.accessor(row => row.residualScoring.riskLevel, {
        id: 'residualRiskLevel',
        header: 'Residual Risk',
        cell: info => {
          const risk = info.row.original;
          const improvement = risk.initialScoring.riskLevel - risk.residualScoring.riskLevel;
          return (
            <div className="flex items-center gap-2">
              <RiskLevelBadge 
                level={risk.residualScoring.riskLevelCategory} 
                score={risk.residualScoring.riskLevel}
                showScore={false}
              />
              <span className="text-xs font-semibold text-slate-600">{risk.residualScoring.riskLevel}</span>
              {improvement > 0 && (
                <span className="text-xs font-medium text-green-600">-{improvement}</span>
              )}
            </div>
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
            return <span className="text-xs text-slate-400 italic">Unassigned</span>;
          }
          
          const initials = (name: string) => {
            return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
          };
          
          if (owners.length <= 2) {
            return (
              <div className="flex items-center gap-1">
                {owners.map((owner: string, idx: number) => (
                  <div key={idx} className="flex items-center gap-1.5 px-2 py-1 bg-slate-100 rounded-md" title={owner}>
                    <div className="w-5 h-5 rounded-full bg-slate-300 flex items-center justify-center">
                      <span className="text-[10px] font-semibold text-slate-700">{initials(owner)}</span>
                    </div>
                    <span className="text-xs font-medium text-slate-700 max-w-[100px] truncate">
                      {owner.split(' ')[0]}
                    </span>
                  </div>
                ))}
              </div>
            );
          }
          
          return (
            <div className="flex items-center gap-1">
              <div className="flex -space-x-2">
                {owners.slice(0, 3).map((owner: string, idx: number) => (
                  <div key={idx} className="w-6 h-6 rounded-full bg-slate-300 flex items-center justify-center ring-2 ring-white" title={owner}>
                    <span className="text-[10px] font-semibold text-slate-700">{initials(owner)}</span>
                  </div>
                ))}
              </div>
              {owners.length > 3 && (
                <span className="text-xs text-slate-500 ml-1">
                  +{owners.length - 3}
                </span>
              )}
            </div>
          );
        },
        size: 150
      }),
      columnHelper.accessor(row => row.relatedControlIds.length, {
        id: 'controlCount',
        header: 'Controls',
        cell: info => {
          const risk = info.row.original;
          const count = info.getValue();
          const relatedControls = controls.filter(c => 
            risk.relatedControlIds?.includes(c.mitigationID)
          );
          
          const tooltipContent = relatedControls.length > 0 
            ? relatedControls.map(c => `${c.mitigationID}: ${c.mitigationDescription}`).join('\n')
            : 'No associated controls found';

          return (
            <div 
              className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md transition-all"
              title={tooltipContent}
              style={{
                background: count > 0 || relatedControls.length > 0 ? 'rgb(239 246 255)' : 'rgb(248 250 252)',
                border: '1px solid',
                borderColor: count > 0 || relatedControls.length > 0 ? 'rgb(191 219 254)' : 'rgb(226 232 240)'
              }}
            >
              <Shield className={cn(
                "h-3.5 w-3.5",
                count > 0 || relatedControls.length > 0 ? "text-blue-600" : "text-slate-400"
              )} />
              <span className={cn(
                "text-xs font-semibold",
                count > 0 || relatedControls.length > 0 ? "text-blue-700" : "text-slate-500"
              )}>
                {relatedControls.length > 0 ? relatedControls.length : count || 0}
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
            <div className="flex items-center gap-1.5">
              <div className={cn(
                "w-2 h-2 rounded-full",
                effectiveness === 'High' ? "bg-green-500" : 
                effectiveness === 'Medium' ? "bg-yellow-500" : 
                effectiveness === 'Low' ? "bg-red-500" : "bg-slate-300"
              )} />
              <span className="text-sm font-medium text-slate-700">
                {effectiveness}
              </span>
            </div>
          );
        },
        size: 120
      }),
      columnHelper.display({
        id: 'actions',
        header: 'Actions',
        cell: info => (
          <Link 
            to={`/risks/${info.row.original.id}`}
            className="inline-flex items-center justify-center w-8 h-8 rounded-md text-slate-500 hover:text-accent hover:bg-blue-50 transition-all group"
          >
            <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
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
        <tbody className="bg-white divide-y divide-slate-100">
          {table.getRowModel().rows.map(row => (
            <tr 
              key={row.id} 
              className="hover:bg-blue-50/50 cursor-pointer transition-all duration-150 group"
              onClick={() => onRowClick?.(row.original)}
            >
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
          <p className="text-slate-500">No risks found matching your criteria.</p>
        </div>
      )}
      </div>
    </div>
  );
};