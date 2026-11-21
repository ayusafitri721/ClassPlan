import { useEffect } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  CONFLICT_MODE_LABEL,
  describeTieBreak,
} from '@classplan/shared';
import { useReport, useRuns } from '../hooks/queries.js';
import { useScope } from '../hooks/useScope.js';
import { PageHeader } from '../components/layout/PageHeader.jsx';
import { Button, buttonClass } from '../components/ui/Button.jsx';
import { Badge, ErrorState, PageLoading } from '../components/ui/Feedback.jsx';
import { formatDateTime, formatSchedule, lecturerNames, periodLabel } from '../lib/format.js';
import { groupStyle } from '../lib/colors.js';

function SheetSection({ number, title, children, breakInside = true }) {
  return (
    <section className={`px-8 py-5 ${breakInside ? 'print-break' : ''}`}>
      <h2 className="flex items-baseline gap-2.5 border-b border-line pb-1.5 text-[13px] font-semibold text-ink">
        <span className="font-mono text-[11px] font-normal text-muted tabular">
          {String(number).padStart(2, '0')}
        </span>
        {title}
      </h2>
      <div className="pt-3 text-[13px] leading-5">{children}</div>
    </section>
  );
}

function KeyValue({ items, columns = 2 }) {
  return (
    <dl
      className="grid gap-x-8 gap-y-1.5"
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
    >
      {items.map((item) => (
        <div key={item.label} className="flex gap-2">
          <dt className="w-36 shrink-0 text-muted">{item.label}</dt>
          <dd className="min-w-0 font-medium">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}

function ReportTable({ head, children, align = [] }) {
  return (
    <table className="w-full border-collapse text-[12px]">
      <thead>
        <tr className="border-y border-line bg-canvas text-left">
          {head.map((label, index) => (
            <th
              key={label}
              scope="col"
              className={`px-2 py-1.5 font-medium text-muted ${
                align[index] === 'right' ? 'text-right' : ''
              }`}
            >
              {label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-line">{children}</tbody>
    </table>
  );
}

function Cell({ children, right = false, mono = false }) {
  return (
    <td className={`px-2 py-1.5 ${right ? 'text-right tabular' : ''} ${mono ? 'font-mono' : ''}`}>
      {children}
    </td>
  );
}

function ReportSheet({ report }) {
  const { meta, optimality, validation } = report;
  const valid = validation.isValid;

  return (
    <article className="print-sheet mx-auto max-w-[210mm] border border-line bg-white">
      <header className="border-b-2 border-navy px-8 pb-5 pt-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[12px] font-medium text-muted">
              {meta.institutionName || 'ClassPlan'}
            </p>
            <h1 className="mt-1 text-[22px] font-semibold leading-7">
              Laporan Analisis Penjadwalan Mata Kuliah
            </h1>
            <p className="mt-1 text-[13px] text-muted">
              {meta.studyProgram ? `${meta.studyProgram} · ` : ''}
              {meta.scopeLabel ?? meta.className} · {periodLabel(meta.academicYear, meta.term)}
            </p>
          </div>
          <div className="text-right text-[11px] leading-5 text-muted">
            <p className="font-mono text-[12px] font-medium text-ink">RUN-{meta.runId}</p>
            <p>Dibuat {formatDateTime(meta.generatedAt)}</p>
            <p>Analisis {formatDateTime(meta.createdAt)}</p>
          </div>
        </div>
      </header>

      <SheetSection number={1} title="Identitas laporan">
        <KeyValue
          items={[
            { label: 'Institusi', value: meta.institutionName || '-' },
            { label: 'Program studi', value: meta.studyProgram || '-' },
            { label: 'Cakupan', value: meta.scopeLabel ?? meta.className },
            { label: 'Semester', value: periodLabel(meta.academicYear, meta.term) },
            {
              label: 'Mode konflik',
              value: CONFLICT_MODE_LABEL[meta.conflictMode] ?? meta.conflictMode,
            },
            { label: 'Aturan seri', value: describeTieBreak(meta.tieBreakRule) },
            { label: 'Waktu analisis', value: formatDateTime(meta.createdAt) },
            { label: 'ID proses', value: `RUN-${meta.runId}` },
          ]}
        />
      </SheetSection>

      <SheetSection number={2} title="Ringkasan hasil">
        <div className="grid grid-cols-2 gap-x-8 gap-y-2 sm:grid-cols-4">
          {[
            { label: 'Simpul', value: report.courses.length },
            { label: 'Sisi', value: report.edges.length },
            { label: 'Warna', value: validation.colorCount },
            { label: 'Batas bawah', value: optimality?.lowerBound ?? '-' },
          ].map((item) => (
            <div key={item.label}>
              <p className="text-[11px] text-muted">{item.label}</p>
              <p className="text-lg font-semibold tabular">{item.value}</p>
            </div>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Badge tone={valid ? 'ok' : 'danger'}>
            {valid ? 'Validasi lolos' : 'Validasi gagal'}
          </Badge>
          {optimality?.status === 'optimal' ? (
            <Badge tone="ok">Optimal</Badge>
          ) : (
            <Badge tone="warn">Belum terbukti optimal</Badge>
          )}
        </div>
        <p className="mt-3 text-[12px] leading-5 text-muted">
          {optimality?.status === 'optimal'
            ? `Jumlah warna sama dengan batas bawah ${optimality.lowerBound}, sehingga hasil terbukti minimum.`
            : `Jumlah warna ${validation.colorCount} dibanding batas bawah ${optimality?.lowerBound ?? '?'}. Selisih ini belum membuktikan hasil bukan minimum.`}
        </p>
      </SheetSection>

      <SheetSection number={3} title="Data mata kuliah">
        <ReportTable
          head={['Kode', 'Mata kuliah', 'SKS', 'Derajat', 'Waktu', 'Dosen pengampu']}
          align={['left', 'left', 'right', 'right', 'left', 'left']}
        >
          {report.courses.map((course) => (
            <tr key={course.code}>
              <Cell mono>{course.code}</Cell>
              <Cell>{course.name}</Cell>
              <Cell right>{course.credits}</Cell>
              <Cell right>{course.degree}</Cell>
              <Cell>{formatSchedule(course)}</Cell>
              <Cell>{lecturerNames(course.lecturers)}</Cell>
            </tr>
          ))}
        </ReportTable>
      </SheetSection>

      <SheetSection number={4} title="Graf konflik">
        <p className="mb-2 text-[12px] text-muted">
          Dua mata kuliah dihubungkan bila memiliki minimal satu dosen pengampu yang sama.
        </p>
        {report.edges.length === 0 ? (
          <p>Tidak ada sisi konflik pada scope ini.</p>
        ) : (
          <ReportTable head={['No', 'Pasangan simpul', 'Dosen penyebab']}>
            {report.edges.map((edge, index) => (
              <tr key={edge.id}>
                <Cell right>{index + 1}</Cell>
                <Cell mono>
                  {edge.u} - {edge.v}
                </Cell>
                <Cell>{edge.reason.lecturerNames.join(', ')}</Cell>
              </tr>
            ))}
          </ReportTable>
        )}
      </SheetSection>

      <SheetSection number={5} title="Matriks ketetanggaan">
        <div className="overflow-x-auto">
          <table className="border-collapse text-[11px]">
            <thead>
              <tr>
                <th className="border border-line bg-canvas px-1.5 py-1 text-left font-medium text-muted">
                  Kode
                </th>
                {report.adjacency.codes.map((code) => (
                  <th
                    key={code}
                    className="border border-line bg-canvas px-1.5 py-1 font-mono font-medium text-muted"
                  >
                    {code}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {report.adjacency.codes.map((rowCode, rowIndex) => (
                <tr key={rowCode}>
                  <th className="border border-line px-1.5 py-1 text-left font-mono font-medium">
                    {rowCode}
                  </th>
                  {report.adjacency.matrix[rowIndex].map((value, columnIndex) => (
                    <td
                      key={`${rowCode}-${report.adjacency.codes[columnIndex]}`}
                      className="border border-line px-1.5 py-1 text-center font-mono tabular"
                    >
                      {rowIndex === columnIndex ? '-' : value}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-[11px] text-muted">
          1 berarti berkonflik, 0 berarti tidak. Diagonal diberi tanda hubung.
        </p>
      </SheetSection>

      <SheetSection number={6} title="Derajat simpul">
        <ReportTable head={['Kode', 'Mata kuliah', 'Derajat']} align={['left', 'left', 'right']}>
          {report.degrees.map((item) => (
            <tr key={item.code}>
              <Cell mono>{item.code}</Cell>
              <Cell>{item.name}</Cell>
              <Cell right>{item.degree}</Cell>
            </tr>
          ))}
        </ReportTable>
      </SheetSection>

      <SheetSection number={7} title="Urutan Welch Powell">
        <p className="mb-2 text-[12px] text-muted">
          Urutan menurut derajat menurun, lalu {describeTieBreak(meta.tieBreakRule)}.
        </p>
        <ReportTable
          head={['Rank', 'Kode', 'Mata kuliah', 'Derajat', 'SKS']}
          align={['right', 'left', 'left', 'right', 'right']}
        >
          {report.order.map((item) => (
            <tr key={item.code}>
              <Cell right>{item.rank}</Cell>
              <Cell mono>{item.code}</Cell>
              <Cell>{item.name}</Cell>
              <Cell right>{item.degree}</Cell>
              <Cell right>{item.credits}</Cell>
            </tr>
          ))}
        </ReportTable>
      </SheetSection>

      <SheetSection number={8} title="Proses pewarnaan">
        <p className="mb-2 text-[12px] text-muted">
          Setiap simpul menerima warna pertama yang tidak dipakai oleh tetangganya pada urutan di
          atas.
        </p>
        <ReportTable head={['Kode', 'Mata kuliah', 'Warna']} align={['left', 'left', 'right']}>
          {report.coloring.map((item) => (
            <tr key={item.code}>
              <Cell mono>{item.code}</Cell>
              <Cell>{item.name}</Cell>
              <Cell right>{item.color}</Cell>
            </tr>
          ))}
        </ReportTable>
      </SheetSection>

      <SheetSection number={9} title="Hasil pengelompokan">
        <div className="space-y-3">
          {report.groups.map((group) => {
            const style = groupStyle(group.color);
            return (
              <div
                key={group.color}
                className="border border-line"
                style={{ borderLeft: `3px solid ${style.line}` }}
              >
                <div className="flex items-center justify-between border-b border-line px-3 py-1.5">
                  <p className="font-medium">
                    Warna {group.color} · {group.courses.length} mata kuliah
                  </p>
                  <p className="text-[12px] text-muted tabular">{group.totalCredits} SKS</p>
                </div>
                <table className="w-full border-collapse text-[12px]">
                  <tbody className="divide-y divide-line">
                    {group.courses.map((course) => (
                      <tr key={course.code}>
                        <Cell mono>{course.code}</Cell>
                        <Cell>{course.name}</Cell>
                        <Cell right>{course.credits} SKS</Cell>
                        <Cell>{lecturerNames(course.lecturers)}</Cell>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          })}
        </div>
      </SheetSection>

      <SheetSection number={10} title="Validasi dan optimalitas">
        <KeyValue
          columns={2}
          items={[
            { label: 'Status validasi', value: valid ? 'Valid' : 'Tidak valid' },
            { label: 'Sisi melanggar', value: String(validation.conflicts.length) },
            { label: 'Simpul tanpa warna', value: String(validation.uncolored.length) },
            { label: 'Jumlah warna', value: String(validation.colorCount) },
            { label: 'Batas bawah', value: String(optimality?.lowerBound ?? '-') },
            {
              label: 'Metode batas',
              value: optimality?.exact ? 'Clique maksimum eksak' : 'Pendekatan heuristik',
            },
            {
              label: 'Status optimal',
              value: optimality?.status === 'optimal' ? 'Terbukti optimal' : 'Belum terbukti',
            },
            { label: 'Contoh clique', value: optimality?.clique?.join(', ') || '-' },
          ]}
        />
        {validation.conflicts.length > 0 ? (
          <div className="mt-3 border border-[#efc2c2] bg-danger-soft px-3 py-2 text-[12px] text-[#7f1d1d]">
            <p className="font-medium">Sisi yang melanggar</p>
            <ul className="mt-1 space-y-0.5">
              {validation.conflicts.map((conflict) => (
                <li key={`${conflict.u}-${conflict.v}`}>
                  {conflict.u} - {conflict.v} (warna {conflict.color ?? '-'})
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </SheetSection>

      <SheetSection number={11} title="Catatan dan batasan">
        <ol className="list-decimal space-y-1.5 pl-5 text-[12px] leading-5">
          {report.limitations.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ol>
      </SheetSection>

      <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-line px-8 py-4 text-[11px] text-muted">
        <p>ClassPlan · Laporan RUN-{meta.runId}</p>
        <p>
          {meta.className} · {periodLabel(meta.academicYear, meta.term)}
        </p>
      </footer>
    </article>
  );
}

export default function ReportPage() {
  const { id } = useParams();
  const scope = useScope();
  const navigate = useNavigate();
  const location = useLocation();
  const runsQuery = useRuns(scope);
  const reportQuery = useReport(id);

  const latest = runsQuery.data?.runs?.[0] ?? null;

  useEffect(() => {
    if (id) return;
    if (!latest) return;
    navigate({ pathname: `/report/${latest.id}`, search: location.search }, { replace: true });
  }, [id, latest, navigate, location.search]);

  const report = reportQuery.data?.report;

  return (
    <div className="space-y-5">
      <div className="no-print space-y-5">
        <PageHeader
          title="Laporan"
          description="Pratinjau cetak berisi identitas, data, langkah, hasil, validasi, dan batasan analisis."
          actions={
            report ? (
              <>
                <Link
                  to={{ pathname: `/results/${report.meta.runId}`, search: location.search }}
                  className={buttonClass()}
                >
                  Kembali ke hasil
                </Link>
                <a
                  href={`/api/scheduling-runs/${report.meta.runId}/export.csv`}
                  className={buttonClass()}
                  download
                >
                  Ekspor CSV
                </a>
                <Button variant="primary" onClick={() => window.print()}>
                  Cetak atau simpan PDF
                </Button>
              </>
            ) : null
          }
        />

        {report ? (
          <div className="rounded-card border border-line bg-surface px-4 py-3">
            <p className="text-[13px] text-muted">
              Ukuran kertas A4. Aktifkan opsi grafik latar pada dialog cetak agar warna kelompok
              ikut tercetak. Nomor halaman disediakan oleh dialog cetak peramban.
            </p>
          </div>
        ) : null}
      </div>

      {scope.missing ? null : reportQuery.isLoading ? (
        <PageLoading label="Menyiapkan laporan" />
      ) : reportQuery.isError ? (
        <ErrorState error={reportQuery.error} onRetry={reportQuery.refetch} />
      ) : report ? (
        <ReportSheet report={report} />
      ) : (
        <ErrorState
          title="Laporan belum tersedia"
          error={{ message: 'Belum ada proses analisis pada scope ini.' }}
        />
      )}
    </div>
  );
}
