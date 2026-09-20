-- ============================================================
-- CHECKPOINT
-- Database automation and integrity
-- Migration: 20260919000100
-- ============================================================

-- ------------------------------------------------------------
-- 1. WHO COMPLETED A TASK
-- ------------------------------------------------------------

alter table public.tasks
add column completed_by uuid
references public.profiles(id) on delete set null;

create index tasks_completed_by_idx
on public.tasks(completed_by);


-- ------------------------------------------------------------
-- 2. IMMUTABLE IDENTITY FIELDS
-- ------------------------------------------------------------

create or replace function public.prevent_task_identity_change()
returns trigger
language plpgsql
as $$
begin
  if new.project_id <> old.project_id then
    raise exception 'A task cannot be moved to another project';
  end if;

  if new.created_by <> old.created_by then
    raise exception 'Task creator cannot be changed';
  end if;

  return new;
end;
$$;

create trigger tasks_prevent_identity_change
before update on public.tasks
for each row
execute function public.prevent_task_identity_change();


create or replace function public.prevent_checkpoint_identity_change()
returns trigger
language plpgsql
as $$
begin
  if new.project_id <> old.project_id then
    raise exception 'A checkpoint cannot be moved to another project';
  end if;

  if new.created_by <> old.created_by then
    raise exception 'Checkpoint creator cannot be changed';
  end if;

  return new;
end;
$$;

create trigger checkpoints_prevent_identity_change
before update on public.checkpoints
for each row
execute function public.prevent_checkpoint_identity_change();


create or replace function public.prevent_project_creator_change()
returns trigger
language plpgsql
as $$
begin
  if new.created_by <> old.created_by then
    raise exception 'Project creator cannot be changed';
  end if;

  return new;
end;
$$;

create trigger projects_prevent_creator_change
before update on public.projects
for each row
execute function public.prevent_project_creator_change();


create or replace function public.prevent_phase_project_change()
returns trigger
language plpgsql
as $$
begin
  if new.project_id <> old.project_id then
    raise exception 'A phase cannot be moved to another project';
  end if;

  return new;
end;
$$;

create trigger phases_prevent_project_change
before update on public.phases
for each row
execute function public.prevent_phase_project_change();


create or replace function public.prevent_member_identity_change()
returns trigger
language plpgsql
as $$
begin
  if new.project_id <> old.project_id then
    raise exception 'A member cannot be moved to another project';
  end if;

  if new.user_id <> old.user_id then
    raise exception 'A member user cannot be changed';
  end if;

  return new;
end;
$$;

create trigger project_members_prevent_identity_change
before update on public.project_members
for each row
execute function public.prevent_member_identity_change();


-- ------------------------------------------------------------
-- 3. TASK COMPLETION
-- ------------------------------------------------------------

create or replace function public.handle_task_completion()
returns trigger
language plpgsql
as $$
begin
  if new.status = 'completed' then

    if old.status is distinct from 'completed' then
      new.completed_at = now();
      new.completed_by = auth.uid();
    elsif new.completed_at is null then
      new.completed_at = coalesce(old.completed_at, now());
      new.completed_by = coalesce(old.completed_by, auth.uid());
    end if;

  else
    new.completed_at = null;
    new.completed_by = null;
  end if;

  return new;
end;
$$;

create trigger tasks_handle_completion
before insert or update on public.tasks
for each row
execute function public.handle_task_completion();


-- ------------------------------------------------------------
-- 4. DEFAULT PROJECT PHASES
-- ------------------------------------------------------------

create or replace function public.create_default_project_phases()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  first_phase_id uuid;
begin

  insert into public.phases (
    project_id,
    name,
    position
  )
  values
    (new.id, 'Idea', 0),
    (new.id, 'Planeación', 1),
    (new.id, 'Arquitectura', 2),
    (new.id, 'Diseño', 3),
    (new.id, 'Implementación', 4),
    (new.id, 'Testing', 5),
    (new.id, 'Deploy', 6),
    (new.id, 'Mantenimiento', 7);

  select id
  into first_phase_id
  from public.phases
  where project_id = new.id
    and position = 0
  limit 1;

  update public.projects
  set current_phase_id = first_phase_id
  where id = new.id;

  return new;
end;
$$;

create trigger projects_create_default_phases
after insert on public.projects
for each row
execute function public.create_default_project_phases();


-- ------------------------------------------------------------
-- 5. AUTOMATIC PROJECT OWNER
-- ------------------------------------------------------------

create or replace function public.add_project_owner()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin

  insert into public.project_members (
    project_id,
    user_id,
    role
  )
  values (
    new.id,
    new.created_by,
    'owner'
  );

  return new;
end;
$$;

create trigger projects_add_owner
after insert on public.projects
for each row
execute function public.add_project_owner();


-- ------------------------------------------------------------
-- 6. ACTIVITY HELPER
-- ------------------------------------------------------------

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
set search_path = public
as $$
begin

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
$$;


-- ------------------------------------------------------------
-- 7. PROJECT ACTIVITY
-- ------------------------------------------------------------

create or replace function public.record_project_activity()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin

  if tg_op = 'INSERT' then

    perform public.record_activity(
      new.id,
      new.created_by,
      'project_created',
      new.id,
      jsonb_build_object(
        'name', new.name
      )
    );

    return new;

  elsif tg_op = 'UPDATE' then

    if new.status is distinct from old.status then

      perform public.record_activity(
        new.id,
        auth.uid(),
        'project_status_changed',
        new.id,
        jsonb_build_object(
          'old_status', old.status,
          'new_status', new.status
        )
      );

    end if;

    if old.current_phase_id is not null
       and new.current_phase_id is distinct from old.current_phase_id then

      perform public.record_activity(
        new.id,
        auth.uid(),
        'phase_changed',
        new.current_phase_id,
        jsonb_build_object(
          'old_phase_id', old.current_phase_id,
          'new_phase_id', new.current_phase_id
        )
      );

    end if;

    return new;

  end if;

  return new;
end;
$$;

create trigger projects_record_activity
after insert or update on public.projects
for each row
execute function public.record_project_activity();


-- ------------------------------------------------------------
-- 8. PHASE ACTIVITY
-- ------------------------------------------------------------

create or replace function public.record_phase_activity()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin

  if tg_op = 'INSERT' then

    perform public.record_activity(
      new.project_id,
      auth.uid(),
      'phase_created',
      new.id,
      jsonb_build_object(
        'name', new.name
      )
    );

    return new;

  elsif tg_op = 'UPDATE' then

    perform public.record_activity(
      new.project_id,
      auth.uid(),
      'phase_updated',
      new.id,
      jsonb_build_object(
        'name', new.name,
        'position', new.position
      )
    );

    return new;

  elsif tg_op = 'DELETE' then

    perform public.record_activity(
      old.project_id,
      auth.uid(),
      'phase_deleted',
      old.id,
      jsonb_build_object(
        'name', old.name
      )
    );

    return old;

  end if;

  return new;
end;
$$;

create trigger phases_record_activity
after insert or update or delete on public.phases
for each row
execute function public.record_phase_activity();


-- ------------------------------------------------------------
-- 9. TASK ACTIVITY
-- ------------------------------------------------------------

create or replace function public.record_task_activity()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin

  if tg_op = 'INSERT' then

    perform public.record_activity(
      new.project_id,
      new.created_by,
      'task_created',
      new.id,
      jsonb_build_object(
        'title', new.title
      )
    );

    return new;

  elsif tg_op = 'UPDATE' then

    if new.status = 'completed'
       and old.status is distinct from 'completed' then

      perform public.record_activity(
        new.project_id,
        coalesce(new.completed_by, auth.uid()),
        'task_completed',
        new.id,
        jsonb_build_object(
          'title', new.title
        )
      );

    elsif old.status = 'completed'
          and new.status is distinct from 'completed' then

      perform public.record_activity(
        new.project_id,
        auth.uid(),
        'task_reopened',
        new.id,
        jsonb_build_object(
          'title', new.title
        )
      );

    else

      perform public.record_activity(
        new.project_id,
        auth.uid(),
        'task_updated',
        new.id,
        jsonb_build_object(
          'title', new.title,
          'status', new.status
        )
      );

    end if;

    return new;

  end if;

  return new;
end;
$$;

create trigger tasks_record_activity
after insert or update on public.tasks
for each row
execute function public.record_task_activity();


-- ------------------------------------------------------------
-- 10. CHECKPOINT ACTIVITY
-- ------------------------------------------------------------

create or replace function public.record_checkpoint_activity()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin

  if tg_op = 'INSERT' then

    perform public.record_activity(
      new.project_id,
      new.created_by,
      'checkpoint_created',
      new.id,
      jsonb_build_object(
        'phase_id', new.phase_id,
        'next_step', new.next_step
      )
    );

    return new;

  elsif tg_op = 'UPDATE' then

    perform public.record_activity(
      new.project_id,
      new.created_by,
      'checkpoint_updated',
      new.id,
      jsonb_build_object(
        'phase_id', new.phase_id
      )
    );

    return new;

  end if;

  return new;
end;
$$;

create trigger checkpoints_record_activity
after insert or update on public.checkpoints
for each row
execute function public.record_checkpoint_activity();


-- ------------------------------------------------------------
-- 11. MEMBER ACTIVITY
-- ------------------------------------------------------------

create or replace function public.record_member_activity()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin

  if tg_op = 'INSERT' then

    perform public.record_activity(
      new.project_id,
      auth.uid(),
      'member_added',
      new.user_id,
      jsonb_build_object(
        'role', new.role
      )
    );

    return new;

  elsif tg_op = 'UPDATE' then

    if new.role is distinct from old.role then

      perform public.record_activity(
        new.project_id,
        auth.uid(),
        'member_role_changed',
        new.user_id,
        jsonb_build_object(
          'old_role', old.role,
          'new_role', new.role
        )
      );

    end if;

    return new;

  elsif tg_op = 'DELETE' then

    perform public.record_activity(
      old.project_id,
      auth.uid(),
      'member_removed',
      old.user_id,
      jsonb_build_object(
        'role', old.role
      )
    );

    return old;

  end if;

  return new;
end;
$$;

create trigger project_members_record_activity
after insert or update or delete on public.project_members
for each row
execute function public.record_member_activity();


-- ------------------------------------------------------------
-- 12. ONLY OWNERS ADMINISTER PHASES
-- ------------------------------------------------------------

drop policy if exists phases_insert_editors
on public.phases;

drop policy if exists phases_update_editors
on public.phases;

create policy phases_insert_owner
on public.phases
for insert
to authenticated
with check (
  public.is_project_owner(project_id)
);

create policy phases_update_owner
on public.phases
for update
to authenticated
using (
  public.is_project_owner(project_id)
)
with check (
  public.is_project_owner(project_id)
);


-- ------------------------------------------------------------
-- 13. ONLY OWNERS ADMINISTER PROJECT INFORMATION
-- ------------------------------------------------------------

drop policy if exists projects_update_editors
on public.projects;

create policy projects_update_owner
on public.projects
for update
to authenticated
using (
  public.is_project_owner(id)
)
with check (
  public.is_project_owner(id)
);


-- ------------------------------------------------------------
-- 14. SAME-PROJECT MEMBERSHIP
-- ------------------------------------------------------------

alter table public.tasks
add constraint tasks_created_by_project_member_fk
foreign key (project_id, created_by)
references public.project_members(project_id, user_id)
on delete restrict;

alter table public.tasks
add constraint tasks_assigned_to_project_member_fk
foreign key (project_id, assigned_to)
references public.project_members(project_id, user_id)
on delete set null;

alter table public.checkpoints
add constraint checkpoints_created_by_project_member_fk
foreign key (project_id, created_by)
references public.project_members(project_id, user_id)
on delete restrict;


-- ------------------------------------------------------------
-- 15. SAME-PROJECT PHASES
-- ------------------------------------------------------------

alter table public.phases
add constraint phases_id_project_unique
unique (id, project_id);

alter table public.tasks
add constraint tasks_phase_project_fk
foreign key (phase_id, project_id)
references public.phases(id, project_id)
on delete set null;

alter table public.checkpoints
add constraint checkpoints_phase_project_fk
foreign key (phase_id, project_id)
references public.phases(id, project_id)
on delete set null;

alter table public.projects
add constraint projects_current_phase_project_fk
foreign key (current_phase_id, id)
references public.phases(id, project_id)
on delete set null;


-- ------------------------------------------------------------
-- 16. FUNCTION PERMISSIONS
-- ------------------------------------------------------------

grant execute on function public.is_project_member(uuid)
to authenticated;

grant execute on function public.is_project_owner(uuid)
to authenticated;

grant execute on function public.can_edit_project(uuid)
to authenticated;