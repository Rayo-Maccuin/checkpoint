-- ============================================================
-- CHECKPOINT
-- Initial database schema
-- ============================================================

-- ------------------------------------------------------------
-- ENUMS
-- ------------------------------------------------------------

create type public.project_status as enum (
  'idea',
  'active',
  'paused',
  'blocked',
  'completed',
  'archived'
);

create type public.project_priority as enum (
  'low',
  'medium',
  'high',
  'critical'
);

create type public.member_role as enum (
  'owner',
  'collaborator',
  'viewer'
);

create type public.task_status as enum (
  'pending',
  'in_progress',
  'completed',
  'blocked',
  'cancelled'
);

create type public.task_priority as enum (
  'low',
  'medium',
  'high',
  'critical'
);

create type public.activity_type as enum (
  'project_created',
  'project_updated',
  'project_status_changed',
  'phase_created',
  'phase_updated',
  'phase_deleted',
  'phase_changed',
  'task_created',
  'task_updated',
  'task_completed',
  'task_reopened',
  'checkpoint_created',
  'checkpoint_updated',
  'member_added',
  'member_removed',
  'member_role_changed'
);

-- ------------------------------------------------------------
-- PROFILES
-- Extends Supabase auth.users with application data.
-- ------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint profiles_name_length
    check (char_length(trim(name)) between 1 and 100)
);

-- ------------------------------------------------------------
-- PROJECTS
-- ------------------------------------------------------------

create table public.projects (
  id uuid primary key default gen_random_uuid(),

  name text not null,
  description text,

  status public.project_status not null default 'idea',
  priority public.project_priority not null default 'medium',

  current_phase_id uuid,

  created_by uuid not null
    references public.profiles(id) on delete restrict,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint projects_name_length
    check (char_length(trim(name)) between 1 and 150)
);

-- ------------------------------------------------------------
-- PROJECT MEMBERS
-- Collaboration boundary.
-- ------------------------------------------------------------

create table public.project_members (
  id uuid primary key default gen_random_uuid(),

  project_id uuid not null
    references public.projects(id) on delete cascade,

  user_id uuid not null
    references public.profiles(id) on delete cascade,

  role public.member_role not null default 'collaborator',

  created_at timestamptz not null default now(),

  constraint project_members_unique_user
    unique (project_id, user_id)
);

-- ------------------------------------------------------------
-- PHASES
-- ------------------------------------------------------------

create table public.phases (
  id uuid primary key default gen_random_uuid(),

  project_id uuid not null
    references public.projects(id) on delete cascade,

  name text not null,
  description text,

  position integer not null,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint phases_name_length
    check (char_length(trim(name)) between 1 and 100),

  constraint phases_position_positive
    check (position >= 0),

  constraint phases_unique_position
    unique (project_id, position)
);

-- ------------------------------------------------------------
-- TASKS
-- ------------------------------------------------------------

create table public.tasks (
  id uuid primary key default gen_random_uuid(),

  project_id uuid not null
    references public.projects(id) on delete cascade,

  phase_id uuid
    references public.phases(id) on delete set null,

  title text not null,
  description text,

  status public.task_status not null default 'pending',
  priority public.task_priority not null default 'medium',

  assigned_to uuid
    references public.profiles(id) on delete set null,

  created_by uuid not null
    references public.profiles(id) on delete restrict,

  completed_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint tasks_title_length
    check (char_length(trim(title)) between 1 and 200),

  constraint tasks_completion_consistency
    check (
      (status = 'completed' and completed_at is not null)
      or
      (status <> 'completed' and completed_at is null)
    )
);

-- ------------------------------------------------------------
-- CHECKPOINTS
-- The core concept of Checkpoint.
-- ------------------------------------------------------------

create table public.checkpoints (
  id uuid primary key default gen_random_uuid(),

  project_id uuid not null
    references public.projects(id) on delete cascade,

  phase_id uuid
    references public.phases(id) on delete set null,

  created_by uuid not null
    references public.profiles(id) on delete restrict,

  what_done text not null default '',
  what_works text not null default '',
  what_remains text not null default '',
  blockers text not null default '',
  next_step text not null default '',

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint checkpoints_content_limit
    check (
      char_length(what_done) <= 5000
      and char_length(what_works) <= 5000
      and char_length(what_remains) <= 5000
      and char_length(blockers) <= 5000
      and char_length(next_step) <= 2000
    )
);

-- ------------------------------------------------------------
-- ACTIVITY
-- Lightweight project history.
-- ------------------------------------------------------------

create table public.activity (
  id uuid primary key default gen_random_uuid(),

  project_id uuid not null
    references public.projects(id) on delete cascade,

  user_id uuid
    references public.profiles(id) on delete set null,

  type public.activity_type not null,

  entity_id uuid,

  metadata jsonb not null default '{}'::jsonb,

  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- FOREIGN KEY FOR CURRENT PHASE
-- Added after phases exists.
-- ------------------------------------------------------------

alter table public.projects
  add constraint projects_current_phase_fk
  foreign key (current_phase_id)
  references public.phases(id)
  on delete set null;

-- ------------------------------------------------------------
-- INDEXES
-- ------------------------------------------------------------

create index projects_created_by_idx
  on public.projects(created_by);

create index projects_status_idx
  on public.projects(status);

create index projects_updated_at_idx
  on public.projects(updated_at desc);

create index project_members_user_id_idx
  on public.project_members(user_id);

create index project_members_project_id_idx
  on public.project_members(project_id);

create index phases_project_id_position_idx
  on public.phases(project_id, position);

create index tasks_project_id_idx
  on public.tasks(project_id);

create index tasks_phase_id_idx
  on public.tasks(phase_id);

create index tasks_assigned_to_idx
  on public.tasks(assigned_to);

create index tasks_status_idx
  on public.tasks(status);

create index checkpoints_project_id_created_at_idx
  on public.checkpoints(project_id, created_at desc);

create index checkpoints_created_by_idx
  on public.checkpoints(created_by);

create index activity_project_id_created_at_idx
  on public.activity(project_id, created_at desc);

create index activity_user_id_idx
  on public.activity(user_id);

-- ------------------------------------------------------------
-- UPDATED_AT FUNCTION
-- ------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ------------------------------------------------------------
-- UPDATED_AT TRIGGERS
-- ------------------------------------------------------------

create trigger profiles_set_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

create trigger projects_set_updated_at
before update on public.projects
for each row
execute function public.set_updated_at();

create trigger phases_set_updated_at
before update on public.phases
for each row
execute function public.set_updated_at();

create trigger tasks_set_updated_at
before update on public.tasks
for each row
execute function public.set_updated_at();

create trigger checkpoints_set_updated_at
before update on public.checkpoints
for each row
execute function public.set_updated_at();

-- ------------------------------------------------------------
-- PROFILE CREATION
-- Creates an application profile whenever a user signs up.
-- ------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name)
  values (
    new.id,
    coalesce(
      nullif(trim(new.raw_user_meta_data ->> 'name'), ''),
      split_part(new.email, '@', 1),
      'Usuario'
    )
  );

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

-- ------------------------------------------------------------
-- RLS
-- ------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.project_members enable row level security;
alter table public.phases enable row level security;
alter table public.tasks enable row level security;
alter table public.checkpoints enable row level security;
alter table public.activity enable row level security;

-- ------------------------------------------------------------
-- HELPER FUNCTIONS
-- ------------------------------------------------------------

create or replace function public.is_project_member(target_project_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.project_members
    where project_id = target_project_id
      and user_id = auth.uid()
  );
$$;

create or replace function public.is_project_owner(target_project_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.project_members
    where project_id = target_project_id
      and user_id = auth.uid()
      and role = 'owner'
  );
$$;

create or replace function public.can_edit_project(target_project_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.project_members
    where project_id = target_project_id
      and user_id = auth.uid()
      and role in ('owner', 'collaborator')
  );
$$;

-- ------------------------------------------------------------
-- PROFILES POLICIES
-- ------------------------------------------------------------

create policy profiles_select_authenticated
on public.profiles
for select
to authenticated
using (true);

create policy profiles_update_own
on public.profiles
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

-- ------------------------------------------------------------
-- PROJECT POLICIES
-- ------------------------------------------------------------

create policy projects_select_members
on public.projects
for select
to authenticated
using (
  public.is_project_member(id)
);

create policy projects_insert_authenticated
on public.projects
for insert
to authenticated
with check (
  created_by = auth.uid()
);

create policy projects_update_editors
on public.projects
for update
to authenticated
using (
  public.can_edit_project(id)
)
with check (
  public.can_edit_project(id)
);

create policy projects_delete_owner
on public.projects
for delete
to authenticated
using (
  public.is_project_owner(id)
);

-- ------------------------------------------------------------
-- PROJECT MEMBERS POLICIES
-- ------------------------------------------------------------

create policy project_members_select_members
on public.project_members
for select
to authenticated
using (
  public.is_project_member(project_id)
);

create policy project_members_insert_owner
on public.project_members
for insert
to authenticated
with check (
  public.is_project_owner(project_id)
);

create policy project_members_update_owner
on public.project_members
for update
to authenticated
using (
  public.is_project_owner(project_id)
)
with check (
  public.is_project_owner(project_id)
);

create policy project_members_delete_owner
on public.project_members
for delete
to authenticated
using (
  public.is_project_owner(project_id)
);

-- ------------------------------------------------------------
-- PHASE POLICIES
-- ------------------------------------------------------------

create policy phases_select_members
on public.phases
for select
to authenticated
using (
  public.is_project_member(project_id)
);

create policy phases_insert_editors
on public.phases
for insert
to authenticated
with check (
  public.can_edit_project(project_id)
);

create policy phases_update_editors
on public.phases
for update
to authenticated
using (
  public.can_edit_project(project_id)
)
with check (
  public.can_edit_project(project_id)
);

create policy phases_delete_owner
on public.phases
for delete
to authenticated
using (
  public.is_project_owner(project_id)
);

-- ------------------------------------------------------------
-- TASK POLICIES
-- ------------------------------------------------------------

create policy tasks_select_members
on public.tasks
for select
to authenticated
using (
  public.is_project_member(project_id)
);

create policy tasks_insert_editors
on public.tasks
for insert
to authenticated
with check (
  public.can_edit_project(project_id)
  and created_by = auth.uid()
);

create policy tasks_update_editors
on public.tasks
for update
to authenticated
using (
  public.can_edit_project(project_id)
)
with check (
  public.can_edit_project(project_id)
);

create policy tasks_delete_owner
on public.tasks
for delete
to authenticated
using (
  public.is_project_owner(project_id)
);

-- ------------------------------------------------------------
-- CHECKPOINT POLICIES
-- ------------------------------------------------------------

create policy checkpoints_select_members
on public.checkpoints
for select
to authenticated
using (
  public.is_project_member(project_id)
);

create policy checkpoints_insert_editors
on public.checkpoints
for insert
to authenticated
with check (
  public.can_edit_project(project_id)
  and created_by = auth.uid()
);

create policy checkpoints_update_editors
on public.checkpoints
for update
to authenticated
using (
  public.can_edit_project(project_id)
  and created_by = auth.uid()
)
with check (
  public.can_edit_project(project_id)
  and created_by = auth.uid()
);

create policy checkpoints_delete_owner
on public.checkpoints
for delete
to authenticated
using (
  public.is_project_owner(project_id)
);

-- ------------------------------------------------------------
-- ACTIVITY POLICIES
-- ------------------------------------------------------------

create policy activity_select_members
on public.activity
for select
to authenticated
using (
  public.is_project_member(project_id)
);

create policy activity_insert_editors
on public.activity
for insert
to authenticated
with check (
  public.can_edit_project(project_id)
  and user_id = auth.uid()
); 