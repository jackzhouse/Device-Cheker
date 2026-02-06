'use client';

import * as React from 'react';
import { ChevronDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SelectOption {
  value: string;
  label: string;
  isNew?: boolean;
}

interface CreatableSelectProps {
  options: SelectOption[];
  value?: string;
  onChange: (value: string) => void;
  onCreate?: (value: string) => void;
  onInputChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function CreatableSelect({
  options,
  value,
  onChange,
  onCreate,
  onInputChange,
  placeholder = 'Select or create...',
  disabled = false,
  className,
}: CreatableSelectProps) {
  const [isOpen, setIsOpen] = React.useState(false);
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

  const handleInputChange = (newValue: string) => {
    setInputValue(newValue);
    if (onInputChange) {
      onInputChange(newValue);
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
          placeholder={placeholder}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pr-8"
        />
        <button
          type="button"
          onClick={() => {
            onChange('');
            setInputValue('');
            inputRef.current?.focus();
          }}
          className={cn(
            'absolute right-8 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground',
            !value && 'hidden'
          )}
        >
          <X className="h-4 w-4" />
        </button>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
          <ChevronDown className="h-4 w-4" />
        </div>
      </div>

      {isOpen && filteredOptions.length > 0 && (
        <div className="absolute z-50 mt-1 max-h-60 bg-black w-full overflow-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md">
          {filteredOptions.map((option, index) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleSelect(option)}
              onMouseEnter={() => setHighlightedIndex(index)}
              className={cn(
                'relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground',
                index === highlightedIndex && 'bg-accent',
                option.isNew && 'font-semibold text-primary'
              )}
            >
              <span>{option.label}</span>
              {option.isNew && (
                <span className="ml-auto text-xs">+ New</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}