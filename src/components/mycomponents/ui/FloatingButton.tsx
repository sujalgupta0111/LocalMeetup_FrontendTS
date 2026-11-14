import React, { useState, useRef, useEffect, type ReactNode } from 'react';

export interface FloatingButtonProps {
  /** Main rotating icon */
  icon: ReactNode;
  /** Normal collapsed floating state me render hone wala UI (jaise badge/pill) */
  collapsedComponent?: ReactNode;
  /** Hover ya click par expand hone wala menu content */
  expandedContent: ReactNode;
  /** Sidebar ke andar placement (Default: bottom-4 right-4) */
  positionClassName?: string;
  className?: string;
}

export const FloatingButton: React.FC<FloatingButtonProps> = ({
  icon,
  collapsedComponent,
  expandedContent,
  positionClassName = 'bottom-4 right-4',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 180);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    // 'absolute' LeftSidebar ke relative context me lock rahega
    <div
      ref={containerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`absolute z-30 select-none ${positionClassName} ${className}`}
    >
      {/* 3. EXPANDED CONTENT: Sidebar ke andar hi upar float hoga */}
      <div
        className={`absolute bottom-full right-0 pb-2.5 transition-all duration-200 origin-bottom-right ${
          isOpen
            ? 'opacity-100 scale-100 pointer-events-auto translate-y-0'
            : 'opacity-0 scale-95 pointer-events-none translate-y-2'
        }`}
      >
        {expandedContent}
      </div>

      {/* TRIGGER BUTTON WRAPPER */}
      <div className="relative flex items-center justify-center">
        {/* 2. COLLAPSED COMPONENT */}
        {!isOpen && collapsedComponent && (
          <div className="transition-all duration-200">
            {collapsedComponent}
          </div>
        )}

        {/* 1. MAIN TRIGGER BUTTON */}
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="size-11 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-105 active:scale-95 transition-all duration-300 focus:outline-none cursor-pointer"
          aria-label="Sidebar Actions"
        >
          <div
            className={`transition-transform duration-300 flex items-center justify-center ${
              isOpen ? 'rotate-135' : 'rotate-0'
            }`}
          >
            {icon}
          </div>
        </button>
      </div>
    </div>
  );
};

export default FloatingButton;