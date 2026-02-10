'use client';

import * as React from 'react';
import { ChevronDown, X, Trash2, Keyboard, ArrowUp, ArrowDown, CornerDownLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { deleteDropdownOption } from '@/lib/services/dropdown-options.service';
import { toast } from 'sonner';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useLanguage } from '@/contexts/LanguageContext';

export interface SelectOption {
  value: string;
  label: string;
  isNew?: boolean;
  _id?: string; // MongoDB ID for deleting
}

interface CreatableSelectProps {
  options: SelectOption[];
  value?: string;
  onChange: (value: string) => void;
  onCreate?: (value: string) => void;
  onInputChange?: (value: string) => void;
  onDelete?: (optionId: string) => void;
  placeholder?: string;
  disabled?: boolean;
  inputType?: 'text' | 'number';
  className?: string;
}

export function CreatableSelect({
  options,
  value,
  onChange,
  onCreate,
  onInputChange,
  onDelete,
  placeholder,
  disabled = false,
  inputType = 'text',
  className,
}: CreatableSelectProps) {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = React.useState(false);
  const finalPlaceholder = placeholder || t('common.select.placeholder');
  const [inputValue, setInputValue] = React.useState('');
  const [highlightedIndex, setHighlightedIndex] = React.useState(0);
  const [lastCreatedValue, setLastCreatedValue] = React.useState<string | null>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const filteredOptions = React.useMemo(() => {
    if (!inputValue) return options;
    const lowerInput = inputValue.toLowerCase();
    const exactMatch = options.find(
      (opt) => opt.label.toLowerCase() === lowerInput
    );

    if (exactMatch) {
      return [exactMatch];
    }

    const filtered = options.filter((opt) =>
      opt.label.toLowerCase().includes(lowerInput)
    );

    // Add option to create new value
    return [
      ...filtered,
      {
        value: inputValue,
        label: `Create "${inputValue}"`,
        isNew: true,
      },
    ];
  }, [options, inputValue]);

  const selectedOption = options.find((opt) => opt.value === value);

  React.useEffect(() => {
    if (value && lastCreatedValue && value === lastCreatedValue) {
      // Handle newly created value that hasn't been added to options yet
      setInputValue(lastCreatedValue);
    } else if (isOpen && selectedOption) {
      setInputValue(selectedOption.label);
    } else if (!isOpen && selectedOption) {
      setInputValue(selectedOption.label);
    } else if (!isOpen && !selectedOption) {
      setInputValue('');
    }
  }, [isOpen, selectedOption, value, lastCreatedValue]);

  React.useEffect(() => {
    setHighlightedIndex(0);
  }, [filteredOptions]);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        if (!value) setInputValue('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [value]);

  const handleSelect = (option: any) => {
    if (option.isNew && onCreate) {
      setLastCreatedValue(option.value);
      onCreate(option.value);
      // Also call onChange to select the newly created value
      onChange(option.value);
    } else {
      onChange(option.value);
    }
    setIsOpen(false);
    setInputValue(option.label);
    if (onInputChange) {
      onInputChange(option.label);
    }
  };

  const handleDelete = async (e: React.MouseEvent, option: SelectOption) => {
    e.stopPropagation(); // Prevent the option from being selected

    if (!option._id) {
      console.error('Cannot delete option without ID');
      return;
    }

    // Confirm deletion
    if (!confirm(`Are you sure you want to delete "${option.label}"?`)) {
      return;
    }

    try {
      await deleteDropdownOption(option._id);
      toast.success(`"${option.label}" deleted successfully`);

      // Call parent callback if provided
      if (onDelete) {
        onDelete(option._id);
      }

      // Clear input if the deleted option was selected
      if (value === option.value) {
        onChange('');
        setInputValue('');
      }
    } catch (error: any) {
      console.error('Error deleting option:', error);
      toast.error(error.message || 'Failed to delete option');
    }
  };

  const handleInputChange = (newValue: string) => {
    // Filter non-numeric characters if inputType is number
    const processedValue = inputType === 'number'
      ? newValue.replace(/[^0-9]/g, '')
      : newValue;

    setInputValue(processedValue);
    if (onInputChange) {
      onInputChange(processedValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev < filteredOptions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredOptions[highlightedIndex]) {
        handleSelect(filteredOptions[highlightedIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <TooltipProvider>
      <div ref={containerRef} className={cn('relative', className)}>
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => handleInputChange(e.target.value)}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder={finalPlaceholder}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pr-20"
          />
          <button
            type="button"
            onClick={() => {
              onChange('');
              setInputValue('');
              inputRef.current?.focus();
            }}
            className={cn(
              'absolute right-12 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground',
              !value && 'hidden'
            )}
          >
            <X className="h-4 w-4" />
          </button>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-muted-foreground hover:text-foreground">
                <Keyboard className="h-4 w-4" />
              </div>
            </TooltipTrigger>
            <TooltipContent side="left">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs">
                  <div className="flex items-center gap-1">
                    <ArrowUp className="h-3 w-3" />
                    <ArrowDown className="h-3 w-3" />
                  </div>
                  <span>{t('common.select.navigateOptions')}</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <CornerDownLeft className="h-3 w-3" />
                  <span>{t('common.select.selectOption')}</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="bg-muted px-1 rounded">Type</span>
                  <span>{t('common.select.createNew')}</span>
                </div>
              </div>
            </TooltipContent>
          </Tooltip>
        </div>
        
        {/* Keyboard hints below input */}
        <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <kbd className="inline-flex items-center justify-center rounded border bg-muted px-1.5 py-0.5 font-mono text-[10px]">
              ↑↓
            </kbd>
            <span>{t('common.select.navigate')}</span>
          </div>
          <div className="flex items-center gap-1">
            <kbd className="inline-flex items-center justify-center rounded border bg-muted px-1.5 py-0.5 font-mono text-[10px]">
              Enter
            </kbd>
            <span>{t('common.select.select')}</span>
          </div>
          <div className="flex items-center gap-1">
            <kbd className="inline-flex items-center justify-center rounded border bg-muted px-1.5 py-0.5 font-mono text-[10px]">
              Type
            </kbd>
            <span>{t('common.select.createNew')}</span>
          </div>
        </div>

      {isOpen && filteredOptions.length > 0 && (
        <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md">
          {filteredOptions.map((option, index) => (
            <div
              key={option.value}
              onMouseEnter={() => setHighlightedIndex(index)}
              className={cn(
                'relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors',
                index === highlightedIndex && 'bg-accent',
                option.isNew && 'font-semibold text-primary bg-primary/5 hover:bg-primary/10'
              )}
            >
              <button
                type="button"
                onClick={() => handleSelect(option)}
                className="flex-1 text-left hover:text-accent-foreground"
              >
                {option.label}
              </button>
              {option.isNew && (
                <span className="ml-2 flex items-center gap-1 text-xs">
                  <kbd className="inline-flex items-center justify-center rounded border bg-background px-1 py-0.5 font-mono text-[10px] text-primary">
                    Enter
                  </kbd>
                  <span>{t('common.select.toCreate')}</span>
                </span>
              )}
              {!option.isNew && option._id && (
                <button
                  type="button"
                  onClick={(e) => handleDelete(e, option)}
                  className="ml-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 p-1 rounded transition-colors"
                  title="Delete option"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          ))}
          {/* Keyboard hint footer */}
          <div className="mt-1 border-t px-2 py-1.5 text-xs text-muted-foreground bg-muted/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <ArrowUp className="h-3 w-3" />
                  <ArrowDown className="h-3 w-3" />
                </div>
                <span>{t('common.select.toNavigate')}</span>
              </div>
              <div className="flex items-center gap-1">
                <CornerDownLeft className="h-3 w-3" />
                <span>{t('common.select.toSelect')}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    </TooltipProvider>
  );
}
