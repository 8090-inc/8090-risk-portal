import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Badge } from '../components/ui';
import { PageHeader } from '../components/layout/PageHeader';
import { UseCaseGrid } from '../components/usecases/UseCaseGrid';
import { UseCaseFilters } from '../components/usecases/UseCaseFilters';
import { useUseCaseStore } from '../store/useCaseStore';
import { Plus, Download, Filter } from 'lucide-react';

export function UseCasesView() {
  const navigate = useNavigate();
  const [filtersOpen, setFiltersOpen] = useState(false);
  
  const {
    useCases,
    filters,
    loading,
    error,
    fetchUseCases,
    setFilters,
    clearError
  } = useUseCaseStore();
  
  useEffect(() => {
    fetchUseCases();
  }, [fetchUseCases]);
  
  const handleCreateUseCase = () => {
    navigate('/usecases/new');
  };
  
  const handleExport = () => {
    // TODO: Implement export functionality
    console.log('Export use cases');
  };
  
  const handleClearFilters = () => {
    setFilters({});
  };
  
  const activeFilterCount = Object.values(filters).filter(Boolean).length;
  
  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <PageHeader
        title="Use Cases"
        description="Manage AI use cases across the organization"
        actions={
          <div className="flex gap-2">
            <Button 
              variant="secondary" 
              onClick={() => setFiltersOpen(!filtersOpen)}
            >
              <Filter className="mr-2 h-4 w-4" />
              Filters
              {activeFilterCount > 0 && (
                <Badge variant="primary" className="ml-2">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
            <Button variant="secondary" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button onClick={handleCreateUseCase}>
              <Plus className="mr-2 h-4 w-4" />
              Add Use Case
            </Button>
          </div>
        }
      />
      
      {/* Collapsible Filter Panel */}
      {filtersOpen && (
        <div className="mt-6 bg-white shadow rounded-lg p-6">
          <UseCaseFilters
            filters={filters}
            onFiltersChange={setFilters}
            onClearFilters={handleClearFilters}
          />
        </div>
      )}
      
      {/* Error State */}
      {error && (
        <div className="mt-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
          <p className="text-sm text-destructive">{error}</p>
          <Button
            variant="secondary"
            size="sm"
            onClick={clearError}
            className="mt-2"
          >
            Dismiss
          </Button>
        </div>
      )}
      
      {/* Use Cases Grid */}
      <div className="mt-6">
        <UseCaseGrid
          useCases={useCases}
          loading={loading}
        />
      </div>
      
      {/* Results Summary */}
      {!loading && (
        <div className="mt-6 text-center text-sm text-muted-foreground">
          Showing {useCases.length} use case{useCases.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
}