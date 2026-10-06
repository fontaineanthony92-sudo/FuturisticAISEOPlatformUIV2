create table if not exists public.articles (
  id uuid primary key default gen_random_uuid(),
  title text,
  subject text,
  main_keyword text,
  secondary_keywords text[] not null default '{}',
  audience text,
  tone text,
  article_length text,
  meta_description text,
  content text,
  seo_score integer,
  status text not null default 'draft'
    check (status in ('draft', 'review', 'scheduled', 'published')),
  featured_image_url text,
  thumbnail_url text,
  wordpress_post_id text,
  wordpress_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_articles_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists articles_updated_at on public.articles;
create trigger articles_updated_at
before update on public.articles
for each row
execute function public.set_articles_updated_at();

alter table public.articles enable row level security;

create table if not exists public.media_assets (
  id uuid primary key default gen_random_uuid(),
  filename text not null,
  storage_path text not null,
  public_url text not null,
  mime_type text,
  size_bytes bigint,
  alt_text text,
  source text not null default 'upload',
  created_at timestamptz not null default now()
);

alter table public.media_assets enable row level security;
