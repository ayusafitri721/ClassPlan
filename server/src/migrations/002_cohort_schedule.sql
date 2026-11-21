-- Angkatan dipisah dari tahun akademik: satu kelas bisa ber cohort berbeda
-- pada semester yang sama.
alter table classes add column cohort_year smallint;
update classes set cohort_year = 2026 where cohort_year is null;
alter table classes alter column cohort_year set not null;
alter table classes drop constraint classes_name_study_program_key;
alter table classes add constraint classes_name_study_program_cohort_key
  unique (name, study_program, cohort_year);

-- Jadwal kuliah disimpan sebagai metadata. Sisi konflik tetap dari dosen,
-- bukan dari overlap waktu.
alter table courses add column day_of_week text
  check (day_of_week in ('senin', 'selasa', 'rabu', 'kamis', 'jumat'));
alter table courses add column start_time time;
alter table courses add column end_time time;

-- Satu run bisa mencakup lebih dari satu kelas (mode gabungan).
alter table scheduling_runs add column scope_label text not null default '';
alter table scheduling_runs add column is_combined boolean not null default false;

create table run_scopes (
  run_id   bigint not null references scheduling_runs(id) on delete cascade,
  class_id bigint not null references classes(id) on delete restrict,
  primary key (run_id, class_id)
);
create index run_scopes_run_idx on run_scopes (run_id);
create index run_scopes_class_idx on run_scopes (class_id);
