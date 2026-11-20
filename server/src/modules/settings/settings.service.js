import { query } from '../../db/pool.js';

const SETTINGS_SQL = `
  select institution_name as "institutionName",
         study_program as "studyProgram",
         academic_year as "academicYear",
         term,
         default_conflict_mode as "defaultConflictMode",
         tie_break_rule as "tieBreakRule",
         updated_at as "updatedAt"
    from app_settings
   where id = 1
`;

export async function getSettings() {
  await query('insert into app_settings (id) values (1) on conflict (id) do nothing');
  const { rows } = await query(SETTINGS_SQL);
  return rows[0];
}

export async function updateSettings(input) {
  await query(
    `insert into app_settings
       (id, institution_name, study_program, academic_year, term, default_conflict_mode, tie_break_rule)
     values (1, $1, $2, $3, $4, $5, $6::jsonb)
     on conflict (id) do update
       set institution_name = excluded.institution_name,
           study_program = excluded.study_program,
           academic_year = excluded.academic_year,
           term = excluded.term,
           default_conflict_mode = excluded.default_conflict_mode,
           tie_break_rule = excluded.tie_break_rule`,
    [
      input.institutionName,
      input.studyProgram,
      input.academicYear,
      input.term,
      input.defaultConflictMode,
      JSON.stringify(input.tieBreakRule),
    ]
  );

  return getSettings();
}
