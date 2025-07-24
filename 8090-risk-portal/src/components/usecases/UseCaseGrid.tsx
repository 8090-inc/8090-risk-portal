import React from 'react';
import { UseCaseCard } from './UseCaseCard';
import type { UseCase } from '../../types/useCase.types';

interface UseCaseGridProps {
  useCases: UseCase[];
  loading?: boolean;
  onUseCaseClick?: (useCase: UseCase) => void;
}

export function UseCaseGrid({ useCases, loading, onUseCaseClick }: UseCaseGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="h-64 bg-muted animate-pulse rounded-lg"
          />
        ))}
      </div>
    );
  }
  
  if (useCases.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No use cases found</p>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {useCases.map((useCase) => (
        <UseCaseCard
          key={useCase.id}
          useCase={useCase}
          onClick={onUseCaseClick ? () => onUseCaseClick(useCase) : undefined}
        />
      ))}
    </div>
  );
}