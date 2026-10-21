-- Private letters shared by the two authenticated members of a couple.
begin;

create table if not exists public.secret_notes (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples(id) on delete cascade,
  created_by uuid not null references public.profiles(id),
  title text not null check (char_length(btrim(title)) between 1 and 80),
  content text not null check (char_length(btrim(content)) between 1 and 3000),
  created_at timestamptz not null default now()
);

create index if not exists secret_notes_couple_date_idx on public.secret_notes(couple_id, created_at desc);
alter table public.secret_notes enable row level security;
revoke all on public.secret_notes from anon;
grant select, insert, delete on public.secret_notes to authenticated;

drop policy if exists "secret notes read by couple" on public.secret_notes;
create policy "secret notes read by couple" on public.secret_notes
  for select to authenticated using (public.is_couple_member(couple_id));

drop policy if exists "secret notes create by member" on public.secret_notes;
create policy "secret notes create by member" on public.secret_notes
  for insert to authenticated with check (public.is_couple_member(couple_id) and created_by = auth.uid());

drop policy if exists "secret notes delete by author" on public.secret_notes;
create policy "secret notes delete by author" on public.secret_notes
  for delete to authenticated using (public.is_couple_member(couple_id) and created_by = auth.uid());

commit;
