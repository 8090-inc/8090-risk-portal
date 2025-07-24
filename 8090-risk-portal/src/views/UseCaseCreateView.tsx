import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/layout/PageHeader';
import { UseCaseForm } from '../components/usecases/UseCaseForm';
import { useUseCaseStore } from '../store/useCaseStore';
import { Breadcrumb, type BreadcrumbItem } from '../components/ui';
import type { UseCase } from '../types/useCase.types';

export function UseCaseCreateView() {
  const navigate = useNavigate();
  const { createUseCase } = useUseCaseStore();
  
  const handleSubmit = async (data: Partial<UseCase>) => {
    try {
      const newUseCase = await createUseCase(data);
      navigate(`/usecases/${newUseCase.id}`);
    } catch (error) {
      console.error('Failed to create use case:', error);
      // Error is handled by the store
    }
  };
  
  const handleCancel = () => {
    navigate('/usecases');
  };
  
  const breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Use Cases', href: '/usecases' },
    { label: 'Create New' }
  ];
  
  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-4">
        <Breadcrumb items={breadcrumbItems} />
      </div>
      
      <PageHeader
        title="Create New Use Case"
        description="Define a new AI use case for your organization"
      />
      
      <div className="mt-6">
        <UseCaseForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
}