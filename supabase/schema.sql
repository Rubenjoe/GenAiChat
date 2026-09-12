create extension if not exists vector;

create table if not exists profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  name text, bio text, education text, interests text, goals text, preferences text,
  updated_at timestamptz not null default now()
);
create table if not exists conversations (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'New conversation', metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists messages (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  conversation_id uuid not null references conversations(id) on delete cascade, role text not null, content text not null,
  created_at timestamptz not null default now()
);
create table if not exists memories (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  content text not null, category text not null default 'context', importance real not null default .5,
  confidence real not null default .5, status text not null default 'active',
  last_discussed_at timestamptz, last_follow_up_at timestamptz, follow_up_eligible boolean not null default false,
  embedding vector(1536), created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists documents (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  name text not null, metadata jsonb not null default '{}'::jsonb, created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists document_chunks (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  document_id uuid not null references documents(id) on delete cascade, content text not null,
  metadata jsonb not null default '{}'::jsonb, embedding vector(1536), created_at timestamptz not null default now()
);

-- Safe upgrades for deployments that ran an earlier version of this schema.
alter table memories add column if not exists status text not null default 'active';
alter table memories add column if not exists last_discussed_at timestamptz;
alter table memories add column if not exists last_follow_up_at timestamptz;
alter table memories add column if not exists follow_up_eligible boolean not null default false;
alter table documents add column if not exists updated_at timestamptz not null default now();
alter table document_chunks add column if not exists metadata jsonb not null default '{}'::jsonb;

alter table profiles enable row level security;
alter table conversations enable row level security;
alter table messages enable row level security;
alter table memories enable row level security;
alter table documents enable row level security;
alter table document_chunks enable row level security;

do $$ declare t text; begin
  foreach t in array array['profiles','conversations','messages','memories','documents','document_chunks'] loop
    execute format('drop policy if exists %I_owner on %I', t || '_owner', t);
    execute format('create policy %I_owner on %I for all using (auth.uid() = user_id) with check (auth.uid() = user_id)', t || '_owner', t);
  end loop;
end $$;
create index if not exists memories_user_idx on memories(user_id);
create index if not exists memories_active_follow_up_idx on memories(user_id, status, last_follow_up_at) where follow_up_eligible;
create index if not exists messages_conversation_idx on messages(user_id, conversation_id, created_at);
create index if not exists document_chunks_user_idx on document_chunks(user_id);
create index if not exists documents_conversation_idx on documents(user_id, ((metadata->>'conversation_id')));
