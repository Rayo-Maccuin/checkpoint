interface DashboardHeaderProps {
  userName?: string | null;
}

export function DashboardHeader({
  userName,
}: DashboardHeaderProps) {
  const displayName = userName?.trim() || 'de nuevo';

  return (
    <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-sm font-medium text-[#02F5A1]">
          Checkpoint
        </p>

        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Hola, {displayName}
        </h1>

        <p className="mt-2 max-w-xl text-sm leading-6 text-white/45 sm:text-base">
          Retoma tus proyectos exactamente donde los dejaste.
        </p>
      </div>
    </header>
  );
}