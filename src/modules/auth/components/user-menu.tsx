'use client';

import { useEffect, useRef, useState } from 'react';

import { ChevronDown, Settings, UserRound } from 'lucide-react';

import { LogoutButton } from '@/modules/auth/components/logout-button';

interface UserMenuProps {
userName?: string | null;
}

export function UserMenu({ userName }: UserMenuProps) {
const [isOpen, setIsOpen] = useState(false);
const menuRef = useRef<HTMLDivElement>(null);

const displayName = userName?.trim() || 'Usuario';

useEffect(() => {
function handlePointerDown(event: PointerEvent) {
if (
menuRef.current &&
!menuRef.current.contains(event.target as Node)
) {
setIsOpen(false);
}
}


function handleKeyDown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    setIsOpen(false);
  }
}

document.addEventListener('pointerdown', handlePointerDown);
document.addEventListener('keydown', handleKeyDown);

return () => {
  document.removeEventListener('pointerdown', handlePointerDown);
  document.removeEventListener('keydown', handleKeyDown);
};


}, []);

return ( <div ref={menuRef} className="relative">
<button
type="button"
onClick={() => setIsOpen((current) => !current)}
aria-expanded={isOpen}
aria-haspopup="menu"
className="group inline-flex h-11 items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-3 pr-3 text-left transition hover:border-white/15 hover:bg-white/[0.07] focus:outline-none focus:ring-2 focus:ring-[#02F5A1]/30"
> <span
       aria-hidden="true"
       className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#02F5A1]/10 text-[#02F5A1]"
     > <UserRound className="size-4" /> </span>

    <span className="hidden max-w-32 truncate text-sm font-medium text-white sm:block">
      {displayName}
    </span>

    <ChevronDown
      aria-hidden="true"
      className={`size-4 text-white/35 transition-transform duration-200 ${
        isOpen ? 'rotate-180' : ''
      }`}
    />
  </button>

  {isOpen && (
    <div
      role="menu"
      aria-label="Menú de usuario"
      className="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-56 overflow-hidden rounded-2xl border border-white/10 bg-[#0B2228] p-1.5 shadow-2xl shadow-black/30"
    >
      <div className="border-b border-white/5 px-3 py-2.5">
        <p className="truncate text-sm font-medium text-white">
          {displayName}
        </p>

        <p className="mt-0.5 text-xs text-white/35">
          Cuenta personal
        </p>
      </div>

      <div className="py-1">
        <button
          type="button"
          role="menuitem"
          disabled
          className="flex w-full cursor-not-allowed items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/30"
        >
          <Settings aria-hidden="true" className="size-4" />
          Configuración
          <span className="ml-auto text-[10px] uppercase tracking-wider text-white/20">
            Próximamente
          </span>
        </button>
      </div>

      <div className="border-t border-white/5 pt-1">
        <LogoutButton />
      </div>
    </div>
  )}
</div>


);
}
