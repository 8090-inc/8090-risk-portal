import React from 'react';
import { Tag, Check } from 'lucide-react';
import { cn } from '../../utils/cn';

interface CategorySidebarProps {
  categories: Array<{
    name: string;
    count: number;
  }>;
  selectedCategories: string[];
  onCategoryToggle: (category: string) => void;
  onClearAll: () => void;
}

export const CategorySidebar: React.FC<CategorySidebarProps> = ({
  categories,
  selectedCategories,
  onCategoryToggle,
  onClearAll
}) => {
  const totalCount = categories.reduce((sum, cat) => sum + cat.count, 0);
  const selectedCount = categories
    .filter(cat => selectedCategories.includes(cat.name))
    .reduce((sum, cat) => sum + cat.count, 0);

  return (
    <div className="w-full bg-white shadow-sm rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Categories</h3>
        {selectedCategories.length > 0 && (
          <button
            onClick={onClearAll}
            className="text-sm text-8090-primary hover:text-8090-primary/80"
          >
            Clear all
          </button>
        )}
      </div>

      <div className="mb-4 pb-4 border-b border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Total Controls</span>
          <span className="font-medium text-gray-900">{totalCount}</span>
        </div>
        {selectedCategories.length > 0 && (
          <div className="flex items-center justify-between text-sm mt-2">
            <span className="text-gray-600">Selected</span>
            <span className="font-medium text-8090-primary">{selectedCount}</span>
          </div>
        )}
      </div>

      <div className="space-y-2">
        {categories.map(category => {
          const isSelected = selectedCategories.includes(category.name);
          return (
            <button
              key={category.name}
              onClick={() => onCategoryToggle(category.name)}
              className={cn(
                "w-full flex items-center justify-between p-3 rounded-lg transition-all border",
                isSelected
                  ? "bg-8090-primary/10 border-8090-primary/20"
                  : "border-gray-200 hover:bg-gray-50 hover:border-gray-300"
              )}
            >
              <div className="flex items-center space-x-3">
                <Tag className={cn(
                  "h-4 w-4",
                  isSelected ? "text-8090-primary" : "text-gray-400"
                )} />
                <span className={cn(
                  "text-sm font-medium",
                  isSelected ? "text-8090-primary" : "text-gray-700"
                )}>
                  {category.name}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className={cn(
                  "text-sm",
                  isSelected ? "text-8090-primary font-medium" : "text-gray-500"
                )}>
                  {category.count}
                </span>
                {isSelected && <Check className="h-4 w-4 text-8090-primary" />}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};