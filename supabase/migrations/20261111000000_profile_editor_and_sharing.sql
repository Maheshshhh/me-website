create table public.profile_shares (
  user_id uuid primary key references public.profiles (user_id) on delete cascade,
  share_token uuid not null unique default gen_random_uuid(),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profile_shares enable row level security;

grant select, insert, update, delete on public.profile_shares to authenticated;
revoke all on public.profile_shares from anon, public;

create policy "Users can manage their own profile share"
  on public.profile_shares for all
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create index profiles_resume_path_idx
  on public.profiles ((profile_data ->> 'resumePath'))
  where profile_data ? 'resumePath';

create or replace function public.get_shared_profile(p_share_token uuid)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'name', p.profile_data -> 'name',
    'title', p.profile_data -> 'title',
    'location', p.profile_data -> 'location',
    'email', p.profile_data -> 'email',
    'website', p.profile_data -> 'website',
    'summary', p.profile_data -> 'summary',
    'skills', p.profile_data -> 'skills',
    'experience', p.profile_data -> 'experience',
    'achievements', p.profile_data -> 'achievements',
    'projects', p.profile_data -> 'projects',
    'education', p.profile_data -> 'education',
    'resumeName', p.profile_data -> 'resumeName',
    'resumePath', p.profile_data -> 'resumePath'
  )
  from public.profile_shares s
  join public.profiles p on p.user_id = s.user_id
  where s.share_token = p_share_token
    and s.is_active;
$$;

revoke all on function public.get_shared_profile(uuid) from public;
grant execute on function public.get_shared_profile(uuid) to anon, authenticated;

create or replace function public.can_read_shared_resume(p_object_name text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles p
    join public.profile_shares s on s.user_id = p.user_id
    where s.is_active
      and split_part(p_object_name, '/', 1) = p.user_id::text
      and p.profile_data ->> 'resumePath' = p_object_name
  );
$$;

revoke all on function public.can_read_shared_resume(text) from public;
grant execute on function public.can_read_shared_resume(text) to anon, authenticated;

grant select on storage.objects to anon;

create policy "Anyone with an active profile share can read its resume"
  on storage.objects for select
  to anon, authenticated
  using (
    bucket_id = 'resumes'
    and public.can_read_shared_resume(name)
  );

notify pgrst, 'reload schema';
