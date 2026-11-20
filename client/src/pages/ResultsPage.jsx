import { useEffect } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { CONFLICT_MODE_LABEL, describeTieBreak } from '@classplan/shared';
import { useRun, useRuns } from '../hooks/queries.js';
import { useScope } from '../hooks/useScope.js';
import { PageHeader } from '../components/layout/PageHeader.jsx';
import { ScopeBar } from '../components/layout/ScopeBar.jsx';
import { Button, buttonClass } from '../components/ui/Button.jsx';
import { Select } from '../components/ui/Form.jsx';
import { Badge, EmptyState, ErrorState, Notice, PageLoading } from '../components/ui/Feedback.jsx';
import { formatDateTime, lecturerNames, periodLabel, plural } from '../lib/format.js';
import { groupStyle } from '../lib/colors.js';

function RunPicker({ scope, currentId }) {
  const runsQuery = useRuns(scope);
  const navigate = useNavigate();
  const location = useLocation();
  const runs = runsQuery.data?.runs ?? [];

  if (runs.length < 2) return null;

  return (
    <div className="flex flex-col gap-2 rounded-card border border-line bg-surface px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <label htmlFor="run-picker" className="text-[13px] font-medium">
        Riwayat analisis
      </label>
      <Select
        id="run-picker"
        className="sm:w-80"
        value={String(currentId ?? '')}
        onChange={(event) =>
          navigate(
            { pathname: `/results/${event.target.value}`, search: location.search },
            { replace: true }
          )
        }
      >
        {runs.map((item) => (
          <option key={item.id} value={item.id}>
            {formatDateTime(item.createdAt)} · {item.colorCount} warna
          </option>
        ))}
      </Select>
    </div>
  );
}

function GroupCard({ group }) {
  const style = groupStyle(group.color);
  const lecturers = [
    ...new Map(
      group.courses.flatMap((course) =>
        (course.lecturers ?? []).map((lecturer) => [lecturer.id, lecturer])
      )
    ).values(),
  ];

  return (
    <article
      className="flex flex-col rounded-card border border-line bg-surface"
      style={{ borderTop: `3px solid ${style.line}` }}
    >
      <header className="flex items-start justify-between gap-3 border-b border-line px-4 py-3">
        <div>
          <p className="text-[12px] text-muted">Kelompok warna</p>
          <h2 className="mt-0.5 flex items-center gap-2 text-base font-semibold">
            <span
              className="inline-block h-2.5 w-2.5 rounded-sm"
              style={{ backgroundColor: style.line }}
              aria-hidden="true"
            />
            Warna {group.color}
          </h2>
        </div>
        <div className="text-right">
          <p className="text-[12px] text-muted">Total SKS</p>
          <p className="mt-0.5 text-lg font-semibold tabular">{group.totalCredits}</p>
        </div>
      </header>

      <ul className="flex-1 divide-y divide-line">
        {group.courses.map((course) => (
          <li key={course.code} className="px-4 py-2.5">
            <div className="flex items-baseline justify-between gap-3">
              <p className="min-w-0">
                <span className="mr-2 font-mono text-[12px] font-medium">{course.code}</span>
                <span className="text-sm">{course.name}</span>
              </p>
              <span className="shrink-0 text-[12px] text-muted tabular">{course.credits} SKS</span>
            </div>
            <p className="mt-0.5 text-[12px] leading-4 text-muted">{lecturerNames(course.lecturers)}</p>
          </li>
        ))}
      </ul>

      <footer className="border-t border-line px-4 py-2.5">
        <p className="text-[12px] text-muted">{plural(lecturers.length, 'dosen', 'dosen')}</p>
      </footer>
    </article>
  );
}

export default function ResultsPage() {
  const { id } = useParams();
  const scope = useScope();
  const navigate = useNavigate();
  const location = useLocation();
  const runsQuery = useRuns(scope);
  const runQuery = useRun(id);

  const latest = runsQuery.data?.runs?.[0] ?? null;

  useEffect(() => {
    if (id) return;
    if (!latest) return;
    navigate(
      { pathname: `/results/${latest.id}`, search: location.search },
      { replace: true }
    );
  }, [id, latest, navigate, location.search]);

  const run = runQuery.data?.run;
  const optimality = run?.settingsSnapshot?.optimality;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Hasil Pengelompokan"
        description="Kelompok warna yang dihasilkan Welch Powell. Kelompok ini bukan jadwal hari, jam, atau ruang."
        actions={
          run ? (
            <>
              <Link
                to={{ pathname: `/report/${run.id}`, search: location.search }}
                className={buttonClass()}
              >
                Buka laporan
              </Link>
              <Link
                to={{ pathname: '/analysis', search: location.search }}
                className={buttonClass({ variant: 'primary' })}
              >
                Analisis baru
              </Link>
            </>
          ) : null
        }
      />

      <ScopeBar scope={scope} />

      {run ? <RunPicker scope={scope} currentId={run.id} /> : null}

      {scope.missing ? null : runsQuery.isLoading || runQuery.isLoading ? (
        <PageLoading label="Memuat hasil analisis" />
      ) : runsQuery.isError ? (
        <ErrorState error={runsQuery.error} onRetry={runsQuery.refetch} />
      ) : !latest && !id ? (
        <div className="rounded-card border border-line bg-surface">
          <EmptyState
            title="Belum ada hasil analisis"
            description="Jalankan Welch Powell pada kelas dan semester ini untuk membentuk kelompok mata kuliah."
            action={
              <Link
                to={{ pathname: '/analysis', search: location.search }}
                className={buttonClass({ variant: 'primary' })}
              >
                Jalankan analisis
              </Link>
            }
          />
        </div>
      ) : runQuery.isError ? (
        <ErrorState error={runQuery.error} onRetry={runQuery.refetch} />
      ) : run ? (
        <>
          <section className="rounded-card border border-line bg-surface">
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line px-5 py-4">
              <div>
                <h2 className="text-base font-semibold">
                  {run.className} · {periodLabel(run.academicYear, run.term)}
                </h2>
                <p className="mt-0.5 text-[13px] text-muted">
                  {formatDateTime(run.createdAt)} · {CONFLICT_MODE_LABEL[run.conflictMode] ?? run.conflictMode} ·{' '}
                  {describeTieBreak(run.tieBreakRule)}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge tone={run.validationStatus === 'valid' ? 'ok' : 'danger'}>
                  {run.validationStatus === 'valid' ? 'Valid' : 'Tidak valid'}
                </Badge>
                {optimality?.status === 'optimal' ? (
                  <Badge tone="ok">Optimal</Badge>
                ) : (
                  <Badge tone="warn">Belum terbukti optimal</Badge>
                )}
              </div>
            </div>

            <dl className="grid grid-cols-2 gap-px bg-line sm:grid-cols-4">
              <div className="bg-surface px-5 py-3">
                <dt className="text-[12px] text-muted">Simpul</dt>
                <dd className="mt-0.5 text-lg font-semibold tabular">{run.vertexCount}</dd>
              </div>
              <div className="bg-surface px-5 py-3">
                <dt className="text-[12px] text-muted">Sisi</dt>
                <dd className="mt-0.5 text-lg font-semibold tabular">{run.edgeCount}</dd>
              </div>
              <div className="bg-surface px-5 py-3">
                <dt className="text-[12px] text-muted">Warna</dt>
                <dd className="mt-0.5 text-lg font-semibold tabular">{run.colorCount}</dd>
              </div>
              <div className="bg-surface px-5 py-3">
                <dt className="text-[12px] text-muted">Batas bawah</dt>
                <dd className="mt-0.5 text-lg font-semibold tabular">
                  {optimality?.lowerBound ?? '-'}
                </dd>
              </div>
            </dl>
          </section>

          <Notice tone="warn" title="Kelompok bukan jadwal">
            Setiap kelompok berisi mata kuliah yang tidak berkonflik menurut kesamaan dosen. Aplikasi
            ini tidak menentukan hari, jam, atau ruang kuliah.
          </Notice>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {run.groups.map((group) => (
              <GroupCard key={group.color} group={group} />
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-line bg-surface px-5 py-4">
            <p className="text-[13px] text-muted">
              Hasil disimpan sebagai snapshot. Perubahan data master tidak mengubah hasil ini.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => navigate({ pathname: '/analysis', search: location.search })}
              >
                Jalankan analisis baru
              </Button>
              <Link
                to={{ pathname: `/report/${run.id}`, search: location.search }}
                className={buttonClass({ variant: 'primary' })}
              >
                Buka laporan
              </Link>
            </div>
          </div>
        </>
      ) : id ? (
        <ErrorState title="Hasil tidak ditemukan" error={runQuery.error} onRetry={runQuery.refetch} />
      ) : null}
    </div>
  );
}
