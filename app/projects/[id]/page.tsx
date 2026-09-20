import Link from 'next/link';

import { ArrowLeft } from 'lucide-react';

import { ProjectDetailView } from '@/modules/projects/components/project-detail';

import { getProjectDetail } from '@/modules/projects/queries/get-project-detail';

interface ProjectPageProps {
params: Promise<{
id: string;
}>;
}

export default async function ProjectPage({
params,
}: ProjectPageProps) {
const { id } = await params;

const result = await getProjectDetail(id);

if (!result.success) {
return ( <main className="min-h-screen bg-[#07191E] px-5 py-8 text-white sm:px-8"> <div className="mx-auto max-w-6xl"> <header className="flex items-center justify-between gap-4"> <Link
           href="/"
           className="inline-flex items-center gap-2 text-sm text-white/45 transition-colors hover:text-white"
         > <ArrowLeft
             aria-hidden="true"
             className="size-4"
           />
Volver al dashboard </Link> </header>

      <section className="mt-16 rounded-3xl border border-red-400/10 bg-red-400/[0.04] p-8">
        <h1 className="text-xl font-semibold">
          No pudimos cargar el proyecto
        </h1>

        <p className="mt-2 text-sm text-white/45">
          {result.message}
        </p>
      </section>
    </div>
  </main>
);

}

return ( <main className="min-h-screen bg-[#07191E] px-5 py-8 text-white sm:px-8"> <div className="mx-auto max-w-6xl"> <header className="mb-8 flex items-center justify-between gap-4"> <Link
         href="/"
         className="inline-flex items-center gap-2 text-sm text-white/45 transition-colors hover:text-white"
       > <ArrowLeft
           aria-hidden="true"
           className="size-4"
         />
Volver al dashboard </Link> </header>

    <ProjectDetailView project={result.project} />
  </div>
</main>


);
}
