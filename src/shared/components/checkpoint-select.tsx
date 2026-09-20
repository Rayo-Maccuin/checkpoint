'use client';

import { Check, ChevronDown } from 'lucide-react';
import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from 'react';

export interface CheckpointSelectOption {
  value: string;
  label: string;
  description?: string;
  icon?: ReactNode;
}

interface CheckpointSelectProps {
  value: string | null | undefined;
  onChange: (value: string) => void;
  options: CheckpointSelectOption[];
  placeholder?: string;
  disabled?: boolean;
  ariaLabel?: string;
  className?: string;
}

export function CheckpointSelect({
  value,
  onChange,
  options,
  placeholder = 'Seleccionar',
  disabled = false,
  ariaLabel,
  className = 'w-full',
}: CheckpointSelectProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();

  const [open, setOpen] = useState(false);
  const [highlightedValue, setHighlightedValue] = useState<
    string | null
  >(
    options.find((option) => option.value === value)?.value ??
      options[0]?.value ??
      null,
  );

  const selectedOption = useMemo(
    () => options.find((option) => option.value === value),
    [options, value],
  );

  const highlightedIndex = useMemo(
    () =>
      options.findIndex(
        (option) => option.value === highlightedValue,
      ),
    [options, highlightedValue],
  );

  useEffect(() => {
    if (!open) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        return;
      }

      if (options.length === 0) {
        return;
      }

      if (event.key === 'ArrowDown') {
        event.preventDefault();

        const nextIndex =
          highlightedIndex < 0 ||
          highlightedIndex >= options.length - 1
            ? 0
            : highlightedIndex + 1;

        setHighlightedValue(options[nextIndex].value);
        return;
      }

      if (event.key === 'ArrowUp') {
        event.preventDefault();

        const previousIndex =
          highlightedIndex <= 0
            ? options.length - 1
            : highlightedIndex - 1;

        setHighlightedValue(options[previousIndex].value);
        return;
      }

      if (event.key === 'Home') {
        event.preventDefault();
        setHighlightedValue(options[0].value);
        return;
      }

      if (event.key === 'End') {
        event.preventDefault();
        setHighlightedValue(
          options[options.length - 1].value,
        );
        return;
      }

      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();

        if (highlightedValue !== null) {
          onChange(highlightedValue);
          setOpen(false);
        }
      }
    };

    document.addEventListener(
      'pointerdown',
      handlePointerDown,
    );

    document.addEventListener(
      'keydown',
      handleKeyDown,
    );

    return () => {
      document.removeEventListener(
        'pointerdown',
        handlePointerDown,
      );

      document.removeEventListener(
        'keydown',
        handleKeyDown,
      );
    };
  }, [
    highlightedIndex,
    highlightedValue,
    onChange,
    open,
    options,
  ]);

  const handleToggle = () => {
    if (disabled) {
      return;
    }

    if (!open) {
      setHighlightedValue(
        selectedOption?.value ??
          options[0]?.value ??
          null,
      );
    }

    setOpen((current) => !current);
  };

  const handleButtonKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
  ) => {
    if (
      event.key !== 'ArrowDown' &&
      event.key !== 'ArrowUp' &&
      event.key !== 'Enter' &&
      event.key !== ' '
    ) {
      return;
    }

    event.preventDefault();

    if (!open) {
      setHighlightedValue(
        selectedOption?.value ??
          options[0]?.value ??
          null,
      );

      setOpen(true);
    }
  };

  const handleOptionSelect = (
    option: CheckpointSelectOption,
  ) => {
    onChange(option.value);
    setHighlightedValue(option.value);
    setOpen(false);
  };

  return (
    <div
      ref={containerRef}
      className={`relative ${className}`}
    >
      <button
        type="button"
        role="combobox"
        aria-label={ariaLabel}
        aria-controls={listboxId}
        aria-expanded={open}
        aria-haspopup="listbox"
        disabled={disabled}
        onClick={handleToggle}
        onKeyDown={handleButtonKeyDown}
        className={[
          'flex h-10 w-full items-center justify-between gap-3 rounded-xl',
          'border border-white/10 bg-white/[0.03] px-3 text-left',
          'text-sm text-white/75 transition',
          'hover:border-white/15 hover:bg-white/[0.05]',
          'focus:outline-none focus:ring-2 focus:ring-[#02F5A1]/20',
          disabled
            ? 'cursor-not-allowed opacity-50'
            : 'cursor-pointer',
        ].join(' ')}
      >
        <span className="flex min-w-0 items-center gap-2.5">
          {selectedOption?.icon && (
            <span className="shrink-0">
              {selectedOption.icon}
            </span>
          )}

          <span
            className={
              selectedOption
                ? 'truncate text-white/75'
                : 'truncate text-white/35'
            }
          >
            {selectedOption?.label ?? placeholder}
          </span>
        </span>

        <ChevronDown
          size={15}
          className={[
            'shrink-0 text-white/30 transition-transform duration-200',
            open
              ? 'rotate-180 text-[#02F5A1]/70'
              : '',
          ].join(' ')}
        />
      </button>

      {open && (
        <div
          id={listboxId}
          role="listbox"
          className={[
            'absolute left-0 right-0 top-[calc(100%+6px)] z-[80]',
            'max-h-64 overflow-auto rounded-2xl',
            'border border-white/10 bg-[#0b2025]/98 p-1.5',
            'shadow-[0_18px_50px_rgba(0,0,0,0.45)] backdrop-blur-xl',
          ].join(' ')}
        >
          {options.map((option) => {
            const isSelected =
              option.value === value;

            const isHighlighted =
              option.value === highlightedValue;

            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                onMouseEnter={() =>
                  setHighlightedValue(
                    option.value,
                  )
                }
                onClick={() =>
                  handleOptionSelect(option)
                }
                className={[
                  'flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left',
                  'transition',
                  isHighlighted
                    ? 'bg-white/[0.06] text-white'
                    : 'text-white/60 hover:bg-white/[0.04] hover:text-white',
                ].join(' ')}
              >
                <span className="flex min-w-0 items-center gap-2.5">
                  {option.icon && (
                    <span className="shrink-0">
                      {option.icon}
                    </span>
                  )}

                  <span className="min-w-0">
                    <span className="block truncate text-sm">
                      {option.label}
                    </span>

                    {option.description && (
                      <span className="mt-0.5 block truncate text-xs text-white/30">
                        {option.description}
                      </span>
                    )}
                  </span>
                </span>

                {isSelected && (
                  <Check
                    size={15}
                    className="shrink-0 text-[#02F5A1]"
                  />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}