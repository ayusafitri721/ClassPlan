create table users (
  id            bigserial primary key,
  name          text not null,
  email         text not null,
  password_hash text not null,
  role          text not null default 'admin' check (role in ('admin', 'viewer')),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create unique index users_email_uidx on users (lower(email));

create table classes (
  id            bigserial primary key,
  name          text not null,
  study_program text not null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (name, study_program)
);

create table semesters (
  id            bigserial primary key,
  academic_year text not null,
  term          text not null check (term in ('ganjil', 'genap')),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (academic_year, term)
);

create table courses (
  id          bigserial primary key,
  code        text not null,
  name        text not null,
  credits     smallint not null check (credits > 0),
  class_id    bigint not null references classes(id) on delete restrict,
  semester_id bigint not null references semesters(id) on delete restrict,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (code, class_id, semester_id)
);
create index courses_scope_idx on courses (class_id, semester_id);

create table lecturers (
  id            bigserial primary key,
  name          text not null,
  lecturer_code text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create unique index lecturers_code_uidx
  on lecturers (lower(lecturer_code))
  where lecturer_code is not null;

create table course_lecturers (
  id          bigserial primary key,
  course_id   bigint not null references courses(id) on delete cascade,
  lecturer_id bigint not null references lecturers(id) on delete restrict,
  unique (course_id, lecturer_id)
);
create index course_lecturers_lecturer_idx on course_lecturers (lecturer_id);

create table app_settings (
  id                    smallint primary key default 1 check (id = 1),
  institution_name      text not null default '',
  study_program         text not null default '',
  academic_year         text not null default '',
  term                  text not null default 'ganjil' check (term in ('ganjil', 'genap')),
  default_conflict_mode text not null default 'lecturer'
                        check (default_conflict_mode in ('lecturer', 'lecturer_class')),
  tie_break_rule        jsonb not null default '["degree_desc", "credits_desc", "course_code_asc"]'::jsonb,
  updated_at            timestamptz not null default now()
);

create table scheduling_runs (
  id                bigserial primary key,
  class_id          bigint not null references classes(id) on delete restrict,
  semester_id       bigint not null references semesters(id) on delete restrict,
  conflict_mode     text not null check (conflict_mode in ('lecturer', 'lecturer_class')),
  tie_break_rule    jsonb not null,
  status            text not null default 'completed' check (status in ('completed', 'failed')),
  vertex_count      int not null,
  edge_count        int not null,
  color_count       int not null,
  validation_status text not null check (validation_status in ('valid', 'invalid')),
  graph_snapshot    jsonb not null,
  trace             jsonb not null,
  settings_snapshot jsonb not null,
  created_by        bigint references users(id) on delete set null,
  created_at        timestamptz not null default now()
);
create index scheduling_runs_scope_idx
  on scheduling_runs (class_id, semester_id, created_at desc);

create table schedule_results (
  id           bigserial primary key,
  run_id       bigint not null references scheduling_runs(id) on delete cascade,
  course_id    bigint references courses(id) on delete set null,
  course_code  text not null,
  course_name  text not null,
  color_number int not null check (color_number > 0),
  unique (run_id, course_code)
);
create index schedule_results_run_idx on schedule_results (run_id, color_number);

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger users_updated_at before update on users
  for each row execute function set_updated_at();
create trigger classes_updated_at before update on classes
  for each row execute function set_updated_at();
create trigger semesters_updated_at before update on semesters
  for each row execute function set_updated_at();
create trigger courses_updated_at before update on courses
  for each row execute function set_updated_at();
create trigger lecturers_updated_at before update on lecturers
  for each row execute function set_updated_at();
create trigger app_settings_updated_at before update on app_settings
  for each row execute function set_updated_at();
