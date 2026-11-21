import { Link, useLocation } from 'react-router-dom';
import { useScope } from '../hooks/useScope.js';
import { useDashboard } from '../hooks/queries.js';
import { PageHeader } from '../components/layout/PageHeader.jsx';
import { ScopeBar } from '../components/layout/ScopeBar.jsx';
import { buttonClass, Button } from '../components/ui/Button.jsx';
import { Badge, EmptyState, ErrorState, Notice, Skeleton } from '../components/ui/Feedback.jsx';
import { formatDateTime } from '../lib/format.js';
import { groupStyle } from '../lib/colors.js';

function Stat({ label, value, note }) {
  return (
    <div className="bg-surface px-4 py-4">
      <p className="text-[12px] font-medium text-muted">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular leading-8 text-ink">{value}</p>
      <p className="mt-0.5 text-[12px] text-muted">{note}</p>
    </div>
  );
}

function ReadinessRow({ ok, title, detail }) {
  return (
    <li className="flex items-start justify-between gap-3 px-5 py-3">
      <div>
        <p className="text-sm font-medium text-ink">{title}</p>
        <p className="mt-0.5 text-[13px] text-muted">{detail}</p>
      </div>
      <Badge tone={ok ? 'ok' : 'warn'}>{ok ? 'Siap' : 'Perlu dilengkapi'}</Badge>
    </li>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true">
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-card border border-line bg-line sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="bg-surface px-4 py-4">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="mt-3 h-6 w-12" />
          </div>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-12">
        <div className="rounded-card border border-line bg-surface p-5 lg:col-span-7">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="mt-4 h-3 w-full" />
          <Skeleton className="mt-2 h-3 w-2/3" />
        </div>
        <div className="rounded-card border border-line bg-surface p-5 lg:col-span-5">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="mt-4 h-3 w-full" />
        </div>
      </div>
      <span className="sr-only">Memuat ringkasan</span>
    </div>
  );
}

export default function DashboardPage() {
  const scope = useScope();
  const location = useLocation();
  const dashboardQuery = useDashboard(scope);
  const data = dashboardQuery.data?.dashboard;

  const analysisLink = { pathname: '/analysis', search: location.search };
  const loading = scope.isLoading || dashboardQuery.isLoading;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Ringkasan data dan hasil analisis terakhir pada kelas dan semester yang dipilih."
        actions={
          <Link to={analysisLink} className={buttonClass({ variant: 'primary' })}>
            Jalankan analisis
          </Link>
        }
      />

      <ScopeBar scope={scope} />

      {scope.missing ? null : loading ? (
        <DashboardSkeleton />
      ) : dashboardQuery.isError ? (
        <ErrorState error={dashboardQuery.error} onRetry={dashboardQuery.refetch} />
      ) : data ? (
        <>
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-card border border-line bg-line sm:grid-cols-4">
            <Stat
              label="Mata kuliah"
              value={data.courseCount}
              note={
                scope.activeSemester
                  ? `${scope.activeClass?.name ?? ''}`
                  : 'pada scope ini'
              }
            />
            <Stat label="Dosen" value={data.lecturerCount} note="seluruh data dosen" />
            <Stat label="Sisi konflik" value={data.edgeCount} note="mode konflik dosen" />
            <Stat
              label="Warna terakhir"
              value={data.lastRun ? data.lastRun.colorCount : '-'}
              note={data.lastRun ? 'hasil analisis terakhir' : 'belum ada analisis'}
            />
          </div>

          {data.courseCount === 0 ? (
            <div className="rounded-card border border-line bg-surface">
              <EmptyState
                title="Belum ada mata kuliah pada scope ini"
                description="Tambahkan mata kuliah dan hubungkan dosen pengampu sebelum menjalankan analisis."
                action={
                  <Link
                    to={{ pathname: '/courses', search: location.search }}
                    className={buttonClass({ variant: 'primary' })}
                  >
                    Tambah mata kuliah
                  </Link>
                }
              />
            </div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-12">
              <section className="rounded-card border border-line bg-surface lg:col-span-7">
                <header className="flex flex-wrap items-start justify-between gap-3 border-b border-line px-5 py-4">
                  <div>
                    <h2 className="text-base font-semibold">Analisis terakhir</h2>
                    <p className="mt-0.5 text-[13px] text-muted">
                      {data.lastRun
                        ? `${formatDateTime(data.lastRun.createdAt)} · ${
                            data.lastRun.scopeLabel ?? ''
                          }`
                        : 'Belum ada proses analisis pada scope ini.'}
                    </p>
                  </div>
                  {data.lastRun ? (
                    <Badge tone={data.lastRun.validationStatus === 'valid' ? 'ok' : 'danger'}>
                      {data.lastRun.validationStatus === 'valid' ? 'Valid' : 'Tidak valid'}
                    </Badge>
                  ) : null}
                </header>

                {data.lastRun ? (
                  <div className="px-5 py-4">
                    <dl className="flex flex-wrap gap-x-8 gap-y-2 text-sm">
                      <div>
                        <dt className="text-[12px] text-muted">Simpul</dt>
                        <dd className="tabular font-medium">{data.lastRun.vertexCount}</dd>
                      </div>
                      <div>
                        <dt className="text-[12px] text-muted">Sisi</dt>
                        <dd className="tabular font-medium">{data.lastRun.edgeCount}</dd>
                      </div>
                      <div>
                        <dt className="text-[12px] text-muted">Warna</dt>
                        <dd className="tabular font-medium">{data.lastRun.colorCount}</dd>
                      </div>
                      <div>
                        <dt className="text-[12px] text-muted">Batas bawah</dt>
                        <dd className="tabular font-medium">
                          {data.lastRun.optimality?.lowerBound ?? '-'}
                        </dd>
                      </div>
                    </dl>

                    <div className="mt-5 space-y-2.5">
                      {data.lastRun.groups.map((group) => (
                        <div key={group.color} className="flex flex-wrap items-center gap-2">
                          <span className="inline-flex items-center gap-1.5 text-[13px] font-medium">
                            <span
                              className="h-2.5 w-2.5 rounded-sm"
                              style={{ backgroundColor: groupStyle(group.color).line }}
                              aria-hidden="true"
                            />
                            Kelompok {group.color}
                          </span>
                          {group.courses.map((code) => (
                            <span
                              key={code}
                              className="rounded border border-line bg-canvas px-1.5 py-0.5 font-mono text-[12px]"
                            >
                              {code}
                            </span>
                          ))}
                        </div>
                      ))}
                    </div>

                    <div className="mt-5 flex flex-wrap gap-2">
                      <Link
                        to={{
                          pathname: `/results/${data.lastRun.id}`,
                          search: location.search,
                        }}
                        className={buttonClass({ variant: 'primary' })}
                      >
                        Lihat hasil
                      </Link>
                      <Link
                        to={{
                          pathname: `/report/${data.lastRun.id}`,
                          search: location.search,
                        }}
                        className={buttonClass()}
                      >
                        Buka laporan
                      </Link>
                    </div>
                  </div>
                ) : (
                  <EmptyState
                    title="Belum ada analisis dijalankan"
                    description="Data sudah tersedia. Jalankan Welch Powell untuk membentuk kelompok mata kuliah."
                    action={
                      <Link to={analysisLink} className={buttonClass({ variant: 'primary' })}>
                        Jalankan analisis
                      </Link>
                    }
                  />
                )}
              </section>

              <section className="rounded-card border border-line bg-surface lg:col-span-5">
                <header className="border-b border-line px-5 py-4">
                  <h2 className="text-base font-semibold">Kesiapan data</h2>
                  <p className="mt-0.5 text-[13px] text-muted">
                    Pemeriksaan sebelum analisis dijalankan.
                  </p>
                </header>

                <ul className="divide-y divide-line">
                  <ReadinessRow
                    ok={data.courseCount > 0}
                    title="Mata kuliah tersedia"
                    detail={`${data.courseCount} mata kuliah pada scope ini.`}
                  />
                  <ReadinessRow
                    ok={data.coursesWithoutLecturers.length === 0 && data.courseCount > 0}
                    title="Setiap mata kuliah punya dosen"
                    detail={
                      data.coursesWithoutLecturers.length === 0
                        ? 'Seluruh mata kuliah sudah terhubung ke minimal satu dosen.'
                        : `Belum ada dosen: ${data.coursesWithoutLecturers.join(', ')}.`
                    }
                  />
                  <ReadinessRow
                    ok={data.canRun}
                    title="Analisis dapat dijalankan"
                    detail={`${data.edgeCount} sisi konflik terdeteksi dari kesamaan dosen.`}
                  />
                </ul>

                {data.coursesWithoutLecturers.length > 0 ? (
                  <div className="px-5 pb-4">
                    <Notice tone="warn" title="Data belum lengkap">
                      Lengkapi dosen pengampu untuk{' '}
                      <strong>{data.coursesWithoutLecturers.join(', ')}</strong> di halaman{' '}
                      <Link
                        to={{ pathname: '/courses', search: location.search }}
                        className="font-medium underline underline-offset-2"
                      >
                        Mata Kuliah
                      </Link>
                      .
                    </Notice>
                  </div>
                ) : (
                  <div className="px-5 py-4 text-[13px] leading-6 text-muted">
                    Analisis memakai mode konflik dosen. Simpul terisolasi tetap dihitung dan
                    akan masuk kelompok pertama.
                  </div>
                )}
              </section>
            </div>
          )}
        </>
      ) : (
        <Button onClick={() => dashboardQuery.refetch()}>Muat ulang</Button>
      )}
    </div>
  );
}
