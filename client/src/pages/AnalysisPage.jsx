import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Background,
  Controls,
  ReactFlow,
  ReactFlowProvider,
} from '@xyflow/react';
import {
  CONFLICT_MODE,
  CONFLICT_MODE_LABEL,
  TIE_BREAK_RULE_OPTIONS,
  describeTieBreak,
} from '@classplan/shared';
import { useAnalyze, useCourses, useDashboard, useSettings } from '../hooks/queries.js';
import { useScope } from '../hooks/useScope.js';
import { PageHeader } from '../components/layout/PageHeader.jsx';
import { ScopeBar } from '../components/layout/ScopeBar.jsx';
import { CourseNode } from '../components/graph/CourseNode.jsx';
import { circularLayout } from '../lib/layout.js';
import { STAGES, deriveColoring, stageIndex, stepLabel } from '../lib/trace.js';
import { groupStyle } from '../lib/colors.js';
import { Button, buttonClass } from '../components/ui/Button.jsx';
import { Select } from '../components/ui/Form.jsx';
import { Badge, EmptyState, ErrorState, Notice, Skeleton } from '../components/ui/Feedback.jsx';
import { Table, TBody, TD, TH, THead, TR } from '../components/ui/Table.jsx';
import { useToast } from '../components/ui/Toast.jsx';

const nodeTypes = { course: CourseNode };

const TYPE_LABEL = {
  GRAPH_BUILT: 'Graf',
  DEGREES_COMPUTED: 'Derajat',
  ORDERED: 'Urutan',
  COLOR_OPENED: 'Warna baru',
  VERTEX_COLORED: 'Pewarnaan',
  VERTEX_SKIPPED: 'Dilewati',
  COLOR_CLOSED: 'Warna selesai',
  VALIDATED: 'Validasi',
};

const SPEEDS = [
  { value: 1400, label: 'Lambat' },
  { value: 900, label: 'Sedang' },
  { value: 550, label: 'Cepat' },
];

function AnalysisCanvas({ vertices, edges, colorOf, activeCode }) {
  const nodes = useMemo(() => {
    const positions = circularLayout(vertices);
    return vertices.map((vertex, index) => {
      const color = colorOf[vertex.code];
      const style = color ? groupStyle(color) : null;
      return {
        id: vertex.code,
        type: 'course',
        position: positions[index],
        draggable: false,
        data: {
          code: vertex.code,
          name: vertex.name,
          degree: vertex.degree,
          color,
          tint: style?.tint,
          line: style?.line,
          active: activeCode === vertex.code,
        },
      };
    });
  }, [vertices, colorOf, activeCode]);

  const flowEdges = useMemo(
    () =>
      edges.map((edge) => ({
        id: edge.id,
        source: edge.u,
        target: edge.v,
        type: 'straight',
        style: {
          stroke:
            colorOf[edge.u] && colorOf[edge.u] === colorOf[edge.v] ? '#b91c1c' : '#cbd5e1',
          strokeWidth: 1.25,
        },
      })),
    [edges, colorOf]
  );

  return (
    <ReactFlow
      nodes={nodes}
      edges={flowEdges}
      nodeTypes={nodeTypes}
      nodesDraggable={false}
      nodesConnectable={false}
      elementsSelectable={false}
      fitView
      fitViewOptions={{ padding: 0.2 }}
      minZoom={0.4}
      maxZoom={1.6}
      proOptions={{ hideAttribution: true }}
      className="h-full w-full"
    >
      <Background color="#dfe4ec" gap={20} />
      <Controls showInteractive={false} position="bottom-left" />
    </ReactFlow>
  );
}

function StageRail({ trace, index, onJump }) {
  const stage = deriveColoring(trace, index).stage;
  const activeIndex = stageIndex(stage);

  return (
    <ol className="grid grid-cols-5 gap-px overflow-hidden rounded-card border border-line bg-line">
      {STAGES.map((item, position) => {
        const state =
          position < activeIndex ? 'done' : position === activeIndex ? 'active' : 'todo';
        return (
          <li key={item.key} className="bg-surface">
            <button
              type="button"
              onClick={() => onJump(item.key)}
              className={`flex h-full w-full flex-col items-start gap-1 px-3 py-2.5 text-left transition-colors hover:bg-canvas ${
                state === 'active' ? 'bg-accent-soft/60' : ''
              }`}
              aria-current={state === 'active' ? 'step' : undefined}
            >
              <span className="flex items-center gap-1.5">
                <span
                  className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-medium tabular ${
                    state === 'todo'
                      ? 'border border-line text-muted'
                      : state === 'active'
                        ? 'bg-accent text-white'
                        : 'bg-ok-soft text-[#14532d]'
                  }`}
                >
                  {position + 1}
                </span>
                <span
                  className={`text-[12px] font-medium ${
                    state === 'active' ? 'text-ink' : 'text-muted'
                  }`}
                >
                  {item.short}
                </span>
              </span>
              <span className="hidden text-[11px] leading-4 text-muted sm:block">
                {item.label}
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}

function StepLog({ log, activeRef }) {
  const list = [...log].reverse().slice(0, 30);

  return (
    <ol className="space-y-1.5 text-[13px]" ref={activeRef}>
      {list.map((step) => (
        <li key={step.step} className="flex gap-2">
          <span className="w-6 shrink-0 pt-0.5 text-right font-mono text-[11px] text-muted tabular">
            {step.step}
          </span>
          <span className="min-w-0 flex-1 leading-5">
            <span className="mr-1 font-medium text-ink">{TYPE_LABEL[step.type] ?? step.type}.</span>
            <span className="text-muted">{stepLabel(step)}</span>
          </span>
        </li>
      ))}
    </ol>
  );
}

function SummaryStrip({ run }) {
  const optimality = run.settingsSnapshot?.optimality;
  return (
    <div className="grid grid-cols-2 gap-px overflow-hidden rounded-card border border-line bg-line sm:grid-cols-5">
      <div className="bg-surface px-4 py-3">
        <p className="text-[12px] text-muted">Simpul</p>
        <p className="mt-0.5 text-xl font-semibold tabular">{run.vertexCount}</p>
      </div>
      <div className="bg-surface px-4 py-3">
        <p className="text-[12px] text-muted">Sisi</p>
        <p className="mt-0.5 text-xl font-semibold tabular">{run.edgeCount}</p>
      </div>
      <div className="bg-surface px-4 py-3">
        <p className="text-[12px] text-muted">Warna</p>
        <p className="mt-0.5 text-xl font-semibold tabular">{run.colorCount}</p>
      </div>
      <div className="bg-surface px-4 py-3">
        <p className="text-[12px] text-muted">Batas bawah</p>
        <p className="mt-0.5 text-xl font-semibold tabular">{optimality?.lowerBound ?? '-'}</p>
      </div>
      <div className="bg-surface px-4 py-3">
        <p className="text-[12px] text-muted">Status</p>
        <div className="mt-1">
          {optimality?.status === 'optimal' ? (
            <Badge tone="ok">Optimal</Badge>
          ) : (
            <Badge tone="warn">Belum terbukti optimal</Badge>
          )}
        </div>
      </div>
    </div>
  );
}

function Player({ run }) {
  const toast = useToast();
  const trace = run.trace;
  const lastIndex = trace.length - 1;
  const [index, setIndex] = useState(lastIndex);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(SPEEDS[1].value);
  const logRef = useRef(null);

  const derived = deriveColoring(trace, index);
  const currentStep = trace[index];

  useEffect(() => {
    if (!playing) return undefined;
    if (index >= lastIndex) {
      setPlaying(false);
      return undefined;
    }
    const timer = window.setTimeout(() => setIndex((value) => value + 1), speed);
    return () => window.clearTimeout(timer);
  }, [playing, index, lastIndex, speed]);

  useEffect(() => {
    setIndex(trace.length - 1);
    setPlaying(false);
  }, [trace]);

  const togglePlay = () => {
    if (playing) {
      setPlaying(false);
      return;
    }
    if (index >= lastIndex) {
      setIndex(0);
      toast.push('Pemutaran dimulai dari langkah pertama.');
    }
    setPlaying(true);
  };

  const jumpToStage = (stageKey) => {
    setPlaying(false);
    const position = trace.findIndex((step) => {
      if (stageKey === 'graph') return step.type === 'GRAPH_BUILT';
      if (stageKey === 'degree') return step.type === 'DEGREES_COMPUTED';
      if (stageKey === 'order') return step.type === 'ORDERED';
      if (stageKey === 'color') return step.type === 'COLOR_OPENED';
      return step.type === 'VALIDATED';
    });
    if (position >= 0) setIndex(position);
  };

  const order = trace.find((step) => step.type === 'ORDERED')?.order ?? [];
  const edges = run.graphSnapshot?.edges ?? [];

  return (
    <div className="space-y-4">
      <SummaryStrip run={run} />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold">Pemutar langkah</h2>
          <p className="mt-0.5 text-[13px] text-muted">
            Langkah {index + 1} dari {trace.length}. {run.settingsSnapshot?.optimality?.exact
              ? 'Batas bawah dihitung dari clique maksimum.'
              : 'Batas bawah dihitung dengan pendekatan heuristik.'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            to={{ pathname: `/results/${run.id}`, search: location.search }}
            className={buttonClass({ variant: 'primary', size: 'sm' })}
          >
            Lihat hasil
          </Link>
          <Link
            to={{ pathname: `/report/${run.id}`, search: location.search }}
            className={buttonClass({ size: 'sm' })}
          >
            Buka laporan
          </Link>
        </div>
      </div>

      <StageRail trace={trace} index={index} onJump={jumpToStage} />

      <div className="grid gap-4 xl:grid-cols-[1fr_320px]">
        <div className="overflow-hidden rounded-card border border-line bg-surface">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-2.5">
            <p className="text-[13px] font-medium">Graf berwarna</p>
            <p className="text-[12px] text-muted">
              {derived.colorCount} warna terbuka
              {derived.activeCode ? ` · simpul aktif ${derived.activeCode}` : ''}
            </p>
          </div>
          <div className="h-[500px]">
            <ReactFlowProvider>
              <AnalysisCanvas
                vertices={run.graphSnapshot?.vertices ?? []}
                edges={edges}
                colorOf={derived.colorOf}
                activeCode={derived.activeCode}
              />
            </ReactFlowProvider>
          </div>
        </div>

        <aside className="flex flex-col rounded-card border border-line bg-surface">
          <div className="border-b border-line px-4 py-3">
            <p className="text-[12px] text-muted">Langkah {index + 1}</p>
            <p className="mt-1 text-sm font-medium leading-5" aria-live="polite">
              {stepLabel(currentStep)}
            </p>
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-3" style={{ maxHeight: 330 }}>
            <StepLog log={derived.log} activeRef={logRef} />
          </div>
          <div className="space-y-2 border-t border-line px-4 py-3">
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                onClick={() => {
                  setPlaying(false);
                  setIndex((value) => Math.max(0, value - 1));
                }}
                disabled={index === 0}
              >
                Sebelumnya
              </Button>
              <Button
                size="sm"
                variant="primary"
                onClick={() => {
                  setPlaying(false);
                  setIndex((value) => Math.min(lastIndex, value + 1));
                }}
                disabled={index >= lastIndex}
              >
                Berikutnya
              </Button>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button size="sm" onClick={togglePlay}>
                {playing ? 'Jeda' : 'Putar otomatis'}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setPlaying(false);
                  setIndex(0);
                }}
              >
                Ulangi
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <label htmlFor="speed" className="text-[12px] text-muted">
                Kecepatan
              </label>
              <Select
                id="speed"
                className="!min-h-9 !py-1 text-[13px]"
                value={speed}
                onChange={(event) => setSpeed(Number(event.target.value))}
              >
                {SPEEDS.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        </aside>
      </div>

      <section>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold">Urutan dan warna</h2>
          <Badge>{run.colorCount} warna</Badge>
        </div>
        <Table minWidth="min-w-[720px]">
          <THead>
            <TR>
              <TH className="w-[56px] text-right">Rank</TH>
              <TH className="w-[110px]">Kode</TH>
              <TH>Mata kuliah</TH>
              <TH className="w-[70px] text-right">SKS</TH>
              <TH className="w-[90px] text-right">Derajat</TH>
              <TH className="w-[110px]">Warna</TH>
            </TR>
          </THead>
          <TBody>
            {order.map((item) => {
              const color = derived.colorOf[item.code];
              const style = color ? groupStyle(color) : null;
              const isActive = derived.activeCode === item.code;
              return (
                <TR key={item.code} className={isActive ? 'bg-accent-soft/60' : undefined}>
                  <TD className="text-right tabular text-muted">{item.rank}</TD>
                  <TD className="font-mono text-[12px] font-medium">{item.code}</TD>
                  <TD>{item.name}</TD>
                  <TD className="text-right tabular">{item.credits}</TD>
                  <TD className="text-right tabular">{item.degree}</TD>
                  <TD>
                    {color ? (
                      <span className="inline-flex items-center gap-1.5 text-[13px]">
                        <span
                          className="h-2.5 w-2.5 rounded-sm"
                          style={{ backgroundColor: style.line }}
                          aria-hidden="true"
                        />
                        Warna {color}
                      </span>
                    ) : (
                      <span className="text-[13px] text-muted">Belum diwarnai</span>
                    )}
                  </TD>
                </TR>
              );
            })}
          </TBody>
        </Table>
      </section>
    </div>
  );
}

function RunSetup({ scope, dashboard, settings, onRun, pending }) {
  const preferredRule =
    TIE_BREAK_RULE_OPTIONS.find(
      (option) => JSON.stringify(option.rule) === JSON.stringify(settings?.tieBreakRule)
    ) ?? TIE_BREAK_RULE_OPTIONS[0];
  const [ruleValue, setRuleValue] = useState(preferredRule.value);
  const location = useLocation();

  const data = dashboard?.data?.dashboard;
  const ready = Boolean(data?.canRun);
  const selectedRule =
    TIE_BREAK_RULE_OPTIONS.find((option) => option.value === ruleValue)?.rule ?? preferredRule.rule;

  return (
    <div className="grid gap-4 lg:grid-cols-12">
      <section className="space-y-4 rounded-card border border-line bg-surface px-5 py-5 lg:col-span-7">
        <div>
          <h2 className="text-base font-semibold">Data yang akan dianalisis</h2>
          <p className="mt-0.5 text-[13px] text-muted">
            Ringkasan diambil dari kelas dan semester terpilih.
          </p>
        </div>

        {dashboard.isLoading ? (
          <div className="space-y-2" aria-busy="true">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ) : dashboard.isError ? (
          <ErrorState error={dashboard.error} onRetry={dashboard.refetch} />
        ) : data ? (
          <>
            <dl className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
              <div>
                <dt className="text-[12px] text-muted">Mata kuliah</dt>
                <dd className="mt-0.5 text-lg font-semibold tabular">{data.courseCount}</dd>
              </div>
              <div>
                <dt className="text-[12px] text-muted">Sisi konflik</dt>
                <dd className="mt-0.5 text-lg font-semibold tabular">{data.edgeCount}</dd>
              </div>
              <div>
                <dt className="text-[12px] text-muted">Simpul terisolasi</dt>
                <dd className="mt-0.5 text-lg font-semibold tabular">{data.isolatedCount}</dd>
              </div>
            </dl>

            {data.coursesWithoutLecturers.length > 0 ? (
              <Notice tone="warn" title="Data belum lengkap">
                Mata kuliah berikut belum punya dosen pengampu:{' '}
                <strong>{data.coursesWithoutLecturers.join(', ')}</strong>. Mode konflik dosen
                membutuhkan minimal satu dosen untuk setiap mata kuliah.
              </Notice>
            ) : (
              <Notice tone="ok" title="Data siap dianalisis">
                Seluruh mata kuliah sudah punya dosen pengampu.
              </Notice>
            )}

            <div>
              <p className="text-[12px] text-muted">Mode konflik</p>
              <p className="mt-0.5 text-sm font-medium">
                {CONFLICT_MODE_LABEL[CONFLICT_MODE.LECTURER]}
              </p>
              <p className="mt-0.5 text-[13px] leading-5 text-muted">
                Dua mata kuliah dihubungkan bila memiliki minimal satu dosen yang sama.
              </p>
            </div>
          </>
        ) : null}
      </section>

      <section className="space-y-4 rounded-card border border-line bg-surface px-5 py-5 lg:col-span-5">
        <div>
          <h2 className="text-base font-semibold">Pengaturan proses</h2>
          <p className="mt-0.5 text-[13px] text-muted">
            Aturan pemecah seri dipakai ketika derajat simpul sama.
          </p>
        </div>

        <div>
          <label htmlFor="run-rule" className="mb-1.5 block text-[13px] font-medium text-ink">
            Aturan pemecah seri
          </label>
          <Select
            id="run-rule"
            value={ruleValue}
            onChange={(event) => setRuleValue(event.target.value)}
          >
            {TIE_BREAK_RULE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
          <p className="mt-1.5 text-[13px] leading-5 text-muted">
            Urutan aktif: {describeTieBreak(selectedRule)}.
          </p>
        </div>

        <Notice tone="info">
          Analisis menyimpan snapshot graf dan langkah pewarnaan. Perubahan data setelah ini tidak
          mengubah hasil yang sudah tersimpan.
        </Notice>

        <div className="border-t border-line pt-4">
          <Button
            variant="primary"
            className="w-full"
            onClick={() => onRun(selectedRule)}
            loading={pending}
            disabled={!ready}
          >
            Jalankan algoritma
          </Button>
          <p className="mt-2 text-center text-[12px] text-muted">
            {ready
              ? 'Welch Powell dijalankan di server.'
              : scope.missing
                ? 'Tambahkan kelas dan semester terlebih dahulu.'
                : 'Lengkapi data mata kuliah dan dosen untuk menjalankan analisis.'}
          </p>
        </div>

        {!scope.missing ? (
          <p className="text-[13px] leading-5 text-muted">
            Butuh data lain?{' '}
            <Link
              to={{ pathname: '/courses', search: location.search }}
              className="font-medium text-accent underline underline-offset-2"
            >
              Kelola mata kuliah
            </Link>
            .
          </p>
        ) : null}
      </section>
    </div>
  );
}

export default function AnalysisPage() {
  const scope = useScope();
  const coursesQuery = useCourses(scope);
  const dashboardQuery = useDashboard(scope);
  const settingsQuery = useSettings();
  const analyze = useAnalyze();
  const toast = useToast();

  const courses = coursesQuery.data?.courses ?? [];
  const run = analyze.data?.run ?? null;

  const start = async (tieBreakRule) => {
    try {
      const response = await analyze.mutateAsync({
        classId: scope.classId,
        semesterId: scope.semesterId,
        conflictMode: CONFLICT_MODE.LECTURER,
        tieBreakRule,
      });
      toast.push(`Analisis selesai dengan ${response.run.colorCount} warna.`, 'success');
    } catch (error) {
      toast.push(error.message, 'error');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Welch Powell"
        description="Urutkan simpul menurut derajat menurun, lalu warnai tiap simpul dengan warna pertama yang tidak dipakai tetangganya."
      />

      <ScopeBar scope={scope} />

      {scope.missing ? null : coursesQuery.isLoading ? (
        <div className="space-y-3 rounded-card border border-line bg-surface px-5 py-5" aria-busy="true">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      ) : coursesQuery.isError ? (
        <ErrorState error={coursesQuery.error} onRetry={coursesQuery.refetch} />
      ) : courses.length === 0 ? (
        <div className="rounded-card border border-line bg-surface">
          <EmptyState
            title="Belum ada mata kuliah untuk dianalisis"
            description="Tambahkan mata kuliah dan dosen pengampu pada scope ini terlebih dahulu."
            action={
              <Link
                to={{ pathname: '/courses', search: location.search }}
                className={buttonClass({ variant: 'primary' })}
              >
                Kelola mata kuliah
              </Link>
            }
          />
        </div>
      ) : run ? (
        <Player key={run.id} run={run} />
      ) : (
        <RunSetup
          key={settingsQuery.data?.settings?.tieBreakRule?.join('-') ?? 'default'}
          scope={scope}
          dashboard={dashboardQuery}
          settings={settingsQuery.data?.settings}
          onRun={start}
          pending={analyze.isPending}
        />
      )}

      {run ? (
        <div className="flex flex-col gap-3 rounded-card border border-line bg-surface px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[13px] text-muted">
            Ingin mencoba konfigurasi lain? Jalankan ulang analisis untuk membuat snapshot baru.
          </p>
          <Button onClick={() => analyze.reset()} size="sm">
            Jalankan analisis baru
          </Button>
        </div>
      ) : null}

      {analyze.isError ? <ErrorState error={analyze.error} title="Analisis gagal" /> : null}

      <p className="text-[12px] text-muted">
        Langkah yang ditampilkan berasal dari trace yang disimpan bersama hasil analisis.
      </p>
    </div>
  );
}
