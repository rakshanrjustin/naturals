'use client';

import { useState, useRef, useEffect, useId } from 'react';

interface Option {
  value: string;
  label: string;
}

interface Props {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
}

export default function CustomSelect({ value, onChange, options, placeholder = 'Select…' }: Props) {
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const id = useId();

  const selectedLabel = options.find((o) => o.value === value)?.label ?? '';

  // Close on outside click / focus-out
  useEffect(() => {
    function onPointer(e: PointerEvent) {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('pointerdown', onPointer);
    return () => document.removeEventListener('pointerdown', onPointer);
  }, []);

  // Scroll highlighted item into view
  useEffect(() => {
    if (!open || highlighted < 0) return;
    const item = listRef.current?.children[highlighted] as HTMLElement | undefined;
    item?.scrollIntoView({ block: 'nearest' });
  }, [highlighted, open]);

  function openMenu() {
    setHighlighted(options.findIndex((o) => o.value === value));
    setOpen(true);
  }

  function select(v: string) {
    onChange(v);
    setOpen(false);
    triggerRef.current?.focus();
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLButtonElement>) {
    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (!open) {
          openMenu();
        } else if (highlighted >= 0) {
          select(options[highlighted].value);
        }
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (!open) {
          openMenu();
        } else {
          setHighlighted((h) => Math.min(h + 1, options.length - 1));
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (open) setHighlighted((h) => Math.max(h - 1, 0));
        break;
      case 'Escape':
        setOpen(false);
        break;
    }
  }

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger */}
      <button
        ref={triggerRef}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${id}-list`}
        aria-activedescendant={highlighted >= 0 ? `${id}-opt-${highlighted}` : undefined}
        onKeyDown={handleKeyDown}
        onClick={() => (open ? setOpen(false) : openMenu())}
        className={
          'w-full rounded-lg border px-4 py-3 text-sm text-left flex items-center justify-between ' +
          'bg-white transition-colors focus:outline-none focus:ring-2 ' +
          (open
            ? 'border-[#5B2A6F] ring-2 ring-[#5B2A6F]'
            : 'border-[#e8a8c8] focus:border-[#5B2A6F] focus:ring-[#5B2A6F]')
        }
      >
        <span className={value ? 'text-gray-900' : 'text-gray-400'}>
          {selectedLabel || placeholder}
        </span>
        {/* Chevron */}
        <svg
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
          className={`w-4 h-4 flex-shrink-0 text-[#5B2A6F] transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {/* Menu */}
      {open && (
        <ul
          ref={listRef}
          id={`${id}-list`}
          role="listbox"
          className="absolute z-20 mt-1 w-full bg-white border border-[#e8a8c8] rounded-lg shadow-lg max-h-56 overflow-y-auto focus:outline-none"
        >
          {options.map((opt, i) => (
            <li
              key={opt.value}
              id={`${id}-opt-${i}`}
              role="option"
              aria-selected={opt.value === value}
              onMouseEnter={() => setHighlighted(i)}
              onClick={() => select(opt.value)}
              className={
                'px-4 py-2.5 text-sm cursor-pointer transition-colors ' +
                (opt.value === value
                  ? 'bg-[#5B2A6F] text-white'
                  : highlighted === i
                    ? 'bg-[#F3CCE0] text-[#5B2A6F]'
                    : 'text-gray-700 hover:bg-[#F3CCE0] hover:text-[#5B2A6F]')
              }
            >
              {opt.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
