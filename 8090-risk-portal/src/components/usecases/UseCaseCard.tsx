import React, { useState } from 'react';
import { Card, Badge, Button } from '../ui';
import { DollarSign, Calendar, Users, Target, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUseCaseStore } from '../../store';
import type { UseCase } from '../../types/useCase.types';

interface UseCaseCardProps {
  useCase: UseCase;
  onClick?: () => void;
  onEdit?: (useCase: UseCase) => void;
  onDelete?: (useCase: UseCase) => void;
}

export function UseCaseCard({ useCase, onClick, onEdit, onDelete }: UseCaseCardProps) {
  const navigate = useNavigate();
  const { deleteUseCase } = useUseCaseStore();
  const [isDeleting, setIsDeleting] = useState(false);
  
  const handleClick = (e: React.MouseEvent) => {
    // Debug information
    console.log('Click event triggered on card');
    console.log('Event target:', e.target);
    console.log('Current target:', e.currentTarget);
    
    // Prevent card click when clicking action buttons
    if ((e.target as HTMLElement).closest('.action-button')) {
      console.log('Click was on action button, ignoring');
      return;
    }
    
    console.log('Card clicked, navigating to:', `/usecases/${useCase.id}`);
    
    if (onClick) {
      onClick();
    } else {
      navigate(`/usecases/${useCase.id}`);
    }
  };
  
  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(useCase);
    } else {
      navigate(`/usecases/${useCase.id}/edit`);
    }
  };
  
  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!confirm(`Are you sure you want to delete "${useCase.title}"?`)) {
      return;
    }
    
    setIsDeleting(true);
    try {
      await deleteUseCase(useCase.id);
      if (onDelete) {
        onDelete(useCase);
      }
    } catch (error) {
      console.error('Failed to delete use case:', error);
      alert('Failed to delete use case. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };
  
  const handleViewRisks = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/usecases/${useCase.id}/risks`);
  };
  
  // Get status badge variant
  const getStatusVariant = (status?: string) => {
    switch (status) {
      case 'In Production':
        return 'default';
      case 'In Development':
      case 'Pilot':
        return 'secondary';
      case 'Approved':
        return 'secondary';
      case 'On Hold':
      case 'Cancelled':
        return 'destructive';
      default:
        return 'secondary';
    }
  };
  
  // Format currency
  const formatCurrency = (amount?: number) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };
  
  return (
    <Card 
      className="h-full hover:shadow-lg transition-all duration-200 cursor-pointer group relative overflow-hidden"
      onClick={handleClick}
    >
      <div className="p-6 flex flex-col h-full">
        {/* Header with title and actions */}
        <div className="flex justify-between items-start gap-3 mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
              {useCase.title}
            </h3>
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleEdit}
              className="action-button h-9 w-9 p-0 hover:bg-gray-100"
              title="Edit use case"
            >
              <Edit2 className="h-5 w-5 text-gray-600" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              className="action-button h-9 w-9 p-0 hover:bg-gray-100"
              title="Delete use case"
              disabled={isDeleting}
            >
              <Trash2 className="h-5 w-5 text-gray-600" />
            </Button>
          </div>
        </div>
        
        {/* Description */}
        <p className="text-sm text-gray-600 line-clamp-2 mb-4 min-h-[2.5rem]">
          {useCase.description || 'No description available'}
        </p>
        
        <div className="space-y-4 flex-1">
          {/* Status and Business Area */}
          <div className="flex items-center gap-2 flex-wrap">
            {useCase.status && (
              <Badge variant={getStatusVariant(useCase.status)} className="text-xs">
                {useCase.status}
              </Badge>
            )}
            {useCase.businessArea && (
              <Badge variant="secondary" className="text-xs">
                {useCase.businessArea}
              </Badge>
            )}
          </div>
        
          {/* AI Categories */}
          {useCase.aiCategories && useCase.aiCategories.length > 0 && (
            <div className="flex items-center gap-1 flex-wrap">
              {useCase.aiCategories.slice(0, 2).map((category, index) => (
                <span key={index} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700">
                  {category}
                </span>
              ))}
              {useCase.aiCategories.length > 2 && (
                <span className="text-xs text-gray-500">
                  +{useCase.aiCategories.length - 2}
                </span>
              )}
            </div>
          )}
        
          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-3 pt-3">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
                <DollarSign className="h-4 w-4 text-green-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-gray-500">Cost Saving</p>
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {formatCurrency(useCase.impact?.costSaving)}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                <Calendar className="h-4 w-4 text-blue-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-gray-500">Timeline</p>
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {useCase.impact?.effortMonths || 0} months
                </p>
              </div>
            </div>
          </div>
        
        </div>
        
        {/* Footer with Owner and Risk Count */}
        <div className="flex items-center justify-between pt-4 mt-auto border-t border-gray-100">
          <div className="flex items-center gap-2">
            <div className="flex-shrink-0 w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
              <Users className="h-3 w-3 text-gray-600" />
            </div>
            <span className="text-sm text-gray-600 truncate max-w-[120px]">
              {useCase.owner || 'Unassigned'}
            </span>
          </div>
          {useCase.riskCount !== undefined && useCase.riskCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleViewRisks}
              className="action-button -mr-2 px-2 py-1 h-auto hover:bg-gray-100"
            >
              <Target className="h-3.5 w-3.5 text-orange-600 mr-1" />
              <span className="text-sm font-medium text-gray-700">
                {useCase.riskCount} risk{useCase.riskCount !== 1 ? 's' : ''}
              </span>
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}