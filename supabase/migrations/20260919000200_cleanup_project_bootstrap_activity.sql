/*
  Checkpoint
  Migration: 20260919000200_cleanup_project_bootstrap_activity

  Objetivo:
  - No registrar en History las operaciones internas que ocurren
    automáticamente al crear un proyecto:
      * creación del propietario inicial
      * creación de las fases predeterminadas
  - Mantener los eventos normales de fases y colaboradores.
*/

create or replace function public.record_activity(
  target_project_id uuid,
  target_user_id uuid,
  target_type public.activity_type,
  target_entity_id uuid default null,
  target_metadata jsonb default '{}'::jsonb
)
returns void
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  project_created_at timestamptz;
  entity_created_at timestamptz;
begin

  /*
    Las fases predeterminadas se crean automáticamente durante
    el bootstrap del proyecto.

    Para phase_created, target_entity_id corresponde al ID
    de la fase.
  */
  if target_type = 'phase_created'::public.activity_type then

    select created_at
    into entity_created_at
    from public.phases
    where id = target_entity_id;

    select created_at
    into project_created_at
    from public.projects
    where id = target_project_id;

    if entity_created_at is not null
       and project_created_at is not null
       and entity_created_at = project_created_at then
      return;
    end if;

  /*
    El trigger record_member_activity() utiliza user_id como
    entity_id, no project_members.id.

    Por eso aquí identificamos el miembro mediante:
      project_id + user_id
  */
  elsif target_type = 'member_added'::public.activity_type then

    select created_at
    into entity_created_at
    from public.project_members
    where project_id = target_project_id
      and user_id = target_entity_id
    limit 1;

    select created_at
    into project_created_at
    from public.projects
    where id = target_project_id;

    if entity_created_at is not null
       and project_created_at is not null
       and entity_created_at = project_created_at then
      return;
    end if;

  end if;

  insert into public.activity (
    project_id,
    user_id,
    type,
    entity_id,
    metadata
  )
  values (
    target_project_id,
    target_user_id,
    target_type,
    target_entity_id,
    target_metadata
  );

end;
$function$;


grant execute on function public.record_activity(
  uuid,
  uuid,
  public.activity_type,
  uuid,
  jsonb
) to authenticated;


/*
  Función temporal utilizada durante el diagnóstico inicial.
  Ya no es necesaria.
*/
drop function if exists public.debug_auth_uid();