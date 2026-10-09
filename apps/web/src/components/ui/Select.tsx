import React, { useState, useRef, useEffect, useId } from 'react';
import { Icons } from './Icons';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps {
  label: string;
  options: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  helperText?: string;
  placeholder?: string;
  className?: string;
  id?: string;
}

export const Select = React.forwardRef<HTMLDivElement, SelectProps>(
  ({ label, options, value, onChange, error, helperText, placeholder = 'Select...', className = '', id }, ref) => {
    const defaultId = useId();
    const selectId = id || defaultId;
    const listboxId = `${selectId}-listbox`;
    const labelId = `${selectId}-label`;
    const errorId = `${selectId}-error`;
    const helperId = `${selectId}-helper`;

    const [isOpen, setIsOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const [searchQuery, setSearchQuery] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);
    const listboxRef = useRef<HTMLUListElement>(null);
    const searchTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

    const selectedOption = options.find((o) => o.value === value);
    const hasError = !!error;

    useEffect(() => {
      const handleClickOutside = (e: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
          setIsOpen(false);
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
      if (isOpen) {
        setActiveIndex(options.findIndex((o) => o.value === value));
        if (listboxRef.current) {
          listboxRef.current.focus();
        }
      }
    }, [isOpen, value, options]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (!isOpen) {
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setIsOpen(true);
        }
        return;
      }

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setActiveIndex((prev) => (prev < options.length - 1 ? prev + 1 : prev));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setActiveIndex((prev) => (prev > 0 ? prev - 1 : prev));
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          if (activeIndex >= 0 && activeIndex < options.length) {
            onChange?.(options[activeIndex].value);
            setIsOpen(false);
          }
          break;
        case 'Escape':
          e.preventDefault();
          setIsOpen(false);
          break;
        case 'Tab':
          setIsOpen(false);
          break;
        default:
          if (e.key.length === 1) {
            const query = searchQuery + e.key.toLowerCase();
            setSearchQuery(query);
            
            const matchIndex = options.findIndex((o) => o.label.toLowerCase().startsWith(query));
            if (matchIndex !== -1) {
              setActiveIndex(matchIndex);
            }

            if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
            searchTimeoutRef.current = setTimeout(() => setSearchQuery(''), 500);
          }
          break;
      }
    };

    const handleSelect = (val: string) => {
      onChange?.(val);
      setIsOpen(false);
    };

    return (
      <div className={`flex flex-col gap-1 relative ${className}`} ref={containerRef}>
        <label id={labelId} className="text-[14px] font-medium text-(--qc-ink)">
          {label}
        </label>
        <div
          ref={ref}
          role="combobox"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-controls={listboxId}
          aria-labelledby={labelId}
          aria-invalid={hasError}
          aria-describedby={`${hasError ? errorId : ''} ${helperText ? helperId : ''}`.trim() || undefined}
          tabIndex={0}
          onKeyDown={handleKeyDown}
          onClick={() => setIsOpen(!isOpen)}
          className={`
            w-full h-[48px] px-3 bg-(--qc-surface) text-(--qc-ink) flex items-center justify-between cursor-pointer
            border border-(--qc-border) rounded-(--qc-radius-input)
            transition-[border-color,box-shadow] duration-(--qc-duration-fast) ease-(--qc-ease-out)
            focus-visible:outline-hidden focus-visible:border-(--qc-primary) focus-visible:ring-2 focus-visible:ring-(--qc-focus) focus-visible:ring-offset-0
            ${hasError ? 'border-(--qc-danger) focus-visible:border-(--qc-danger) focus-visible:ring-(--qc-danger)' : ''}
          `}
        >
          <span className={selectedOption ? '' : 'text-(--qc-muted)'}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <Icons.ChevronDown className={`w-5 h-5 text-(--qc-muted) transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>

        {isOpen && (
          <ul
            id={listboxId}
            role="listbox"
            ref={listboxRef}
            aria-labelledby={labelId}
            aria-activedescendant={activeIndex >= 0 ? `${selectId}-option-${activeIndex}` : undefined}
            className="absolute top-full left-0 w-full mt-1 bg-(--qc-surface) border border-(--qc-border) rounded-(--qc-radius-card) shadow-(--qc-shadow-card) z-200 max-h-60 overflow-y-auto focus:outline-hidden"
          >
            {options.map((option, index) => {
              const isActive = index === activeIndex;
              const isSelected = option.value === value;
              return (
                <li
                  key={option.value}
                  id={`${selectId}-option-${index}`}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelect(option.value)}
                  onMouseEnter={() => setActiveIndex(index)}
                  className={`
                    h-[44px] px-3 flex items-center cursor-pointer transition-colors text-[14px]
                    ${isActive ? 'bg-(--qc-bg)' : ''}
                    ${isSelected ? 'text-(--qc-primary) font-semibold bg-(--qc-primary-bg)' : 'text-(--qc-ink)'}
                  `}
                >
                  {option.label}
                  {isSelected && <Icons.CheckCircle className="w-4 h-4 ml-auto" />}
                </li>
              );
            })}
          </ul>
        )}
        
        {hasError && (
          <p id={errorId} role="alert" className="text-[12px] text-(--qc-danger) mt-1">
            {error}
          </p>
        )}
        {helperText && !hasError && (
          <p id={helperId} className="text-[12px] text-(--qc-muted) mt-1">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
