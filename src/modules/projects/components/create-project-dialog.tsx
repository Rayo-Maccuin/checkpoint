'use client';

import { useEffect, useState } from 'react';
import { Plus, X } from 'lucide-react';

import { CreateProjectForm } from '@/modules/projects/components/create-project-form';

export function CreateProjectDialog() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      document.body.style.overflow = '';

      return;
    }

    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#02F5A1] px-4 text-sm font-semibold text-[#07191E] transition-all duration-200 hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-[#02F5A1]/50 focus:ring-offset-2 focus:ring-offset-[#07191E]"
      >
        <Plus aria-hidden="true" className="size-4" />
        Nuevo proyecto
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 px-4 py-6 backdrop-blur-sm"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setIsOpen(false);
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-project-dialog-title"
            className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#0a2025] p-6 shadow-2xl shadow-black/40 sm:p-7"
            onMouseDown={(event) => {
              event.stopPropagation();
            }}
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-[#02F5A1]/70">
                  Proyecto
                </p>

                <h2
                  id="create-project-dialog-title"
                  className="mt-2 text-2xl font-semibold tracking-tight text-white"
                >
                  Crear proyecto
                </h2>

                <p className="mt-2 text-sm leading-6 text-white/45">
                  Define la información inicial. Checkpoint preparará
                  automáticamente la estructura base del proyecto.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex size-9 shrink-0 items-center justify-center rounded-lg text-white/40 transition-colors hover:bg-white/5 hover:text-white focus:outline-none focus:ring-2 focus:ring-[#02F5A1]/50"
                aria-label="Cerrar"
              >
                <X aria-hidden="true" className="size-5" />
              </button>
            </div>

            <CreateProjectForm
              onSuccess={() => setIsOpen(false)}
            />
          </section>
        </div>
      )}
    </>
  );
}