import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/layout/PageHeader';
import { UseCaseForm } from '../components/usecases/UseCaseForm';
import { useUseCaseStore } from '../store/useCaseStore';
import { Button, Breadcrumb, type BreadcrumbItem } from '../components/ui';
import type { UseCase } from '../types/useCase.types';

export function UseCaseEditView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { selectedUseCase, loading, error, fetchUseCaseById, updateUseCase } = useUseCaseStore();
  
  useEffect(() => {
    if (id) {
      fetchUseCaseById(id);
    }
  }, [id, fetchUseCaseById]);
  
  const handleSubmit = async (data: Partial<UseCase>) => {
    if (!id) return;
    
    try {
      await updateUseCase(id, data);
      navigate(`/usecases/${id}`);
    } catch (error) {
      console.error('Failed to update use case:', error);
      // Error is handled by the store
    }
  };
  
  const handleCancel = () => {
    navigate(`/usecases/${id}`);
  };
  
  if (loading) {
    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-muted rounded w-2/3 mb-8"></div>
          <div className="space-y-6">
            <div className="h-48 bg-muted rounded"></div>
            <div className="h-48 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
          <p className="text-sm text-destructive">{error}</p>
          <Button
            variant="secondary"
            onClick={() => navigate('/usecases')}
            className="mt-4"
          >
            Back to Use Cases
          </Button>
        </div>
      </div>
    );
  }
  
  if (!selectedUseCase) {
    return null;
  }
  
  const breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Use Cases', href: '/usecases' },
    { label: selectedUseCase.title, href: `/usecases/${id}` },
    { label: 'Edit' }
  ];
  
  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-4">
        <Breadcrumb items={breadcrumbItems} />
      </div>
      
      <PageHeader
        title="Edit Use Case"
        description={`Editing: ${selectedUseCase.title}`}
      />
      
      <div className="mt-6">
        <UseCaseForm
          useCase={selectedUseCase}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
}