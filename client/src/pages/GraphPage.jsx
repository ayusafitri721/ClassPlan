import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Background,
  Controls,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
} from '@xyflow/react';
import {
  CONFLICT_MODE,
  CONFLICT_MODE_EXPLANATION,
  CONFLICT_MODE_LABEL,
} from '@classplan/shared';
import { useGraph } from '../hooks/queries.js';
import { useScope } from '../hooks/useScope.js';
import { PageHeader } from '../components/layout/PageHeader.jsx';
import { ScopeBar } from '../components/layout/ScopeBar.jsx';
import { CourseNode } from '../components/graph/CourseNode.jsx';
import { circularLayout } from '../lib/layout.js';
import { Button } from '../components/ui/Button.jsx';
import { Select } from '../components/ui/Form.jsx';
import { Badge, EmptyState, ErrorState, Notice, Skeleton } from '../components/ui/Feedback.jsx';
import { Table, TBody, TD, TH, THead, TR } from '../components/ui/Table.jsx';

const nodeTypes = { course: CourseNode };

function edgeStyle(selected) {
  return {
    stroke: selected ? '#1d4ed8' : '#94a3b8',
    strokeWidth: selected ? 2 : 1.25,
  };
}

function toFlow(vertices, edges, selection) {
  const positions = circularLayout(vertices);
  const nodes = vertices.map((vertex, index) => ({
    id: vertex.code,
    type: 'course',
    position: positions[index],
    data: {
      code: vertex.code,
      name: vertex.name,
      degree: vertex.degree,
    },
  }));

  const flowEdges = edges.map((edge) => {
    const selected = selection?.type === 'edge' && selection.id === edge.id;
    return {
      id: edge.id,
      source: edge.u,
      target: edge.v,
      type: 'straight',
      style: edgeStyle(selected),
      animated: selected,
      zIndex: selected ? 1 : 0,
    };
  });

  return { nodes, edges: flowEdges };
}

function GraphCanvas({ graph, selection, onSelect }) {
  const initial = useMemo(
    () => toFlow(graph.vertices, graph.edges, selection),
    // Selection changes are applied below without resetting drag positions.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [graph]
  );
  const [nodes, setNodes, onNodesChange] = useNodesState(initial.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initial.edges);

  useEffect(() => {
    setNodes(initial.nodes);
    setEdges(initial.edges);
  }, [initial, setNodes, setEdges]);

  useEffect(() => {
    setEdges((current) =>
      current.map((edge) => {
        const selected = selection?.type === 'edge' && selection.id === edge.id;
        return { ...edge, style: edgeStyle(selected), animated: selected };
      })
    );
    setNodes((current) =>
      current.map((node) => ({
        ...node,
        selected: selection?.type === 'node' && selection.code === node.id,
      }))
    );
  }, [selection, setEdges, setNodes]);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      nodeTypes={nodeTypes}
      onNodeClick={(_, node) => onSelect({ type: 'node', code: node.id })}
      onEdgeClick={(_, edge) => onSelect({ type: 'edge', id: edge.id })}
      onPaneClick={() => onSelect(null)}
      fitView
      fitViewOptions={{ padding: 0.2 }}
      minZoom={0.4}
      maxZoom={1.6}
      nodesConnectable={false}
      edgesFocusable
      proOptions={{ hideAttribution: true }}
      className="h-full w-full"
    >
      <Background color="#dfe4ec" gap={20} />
      <Controls showInteractive={false} position="bottom-left" />
    </ReactFlow>
  );
}

function NodeDetail({ vertex, onClear }) {
  return (
    <div className="space-y-3">
      <div>
        <p className="font-mono text-[12px] font-medium text-muted">{vertex.code}</p>
        <h2 className="mt-0.5 text-base font-semibold leading-6">{vertex.name}</h2>
      </div>
      <dl className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-[12px] text-muted">Derajat</dt>
          <dd className="tabular font-medium">{vertex.degree}</dd>
        </div>
        <div>
          <dt className="text-[12px] text-muted">SKS</dt>
          <dd className="tabular font-medium">{vertex.credits}</dd>
        </div>
      </dl>
      <div>
        <p className="text-[12px] text-muted">Dosen pengampu</p>
        <ul className="mt-1 space-y-1 text-sm">
          {vertex.lecturers.map((lecturer) => (
            <li key={lecturer.id}>{lecturer.name}</li>
          ))}
        </ul>
      </div>
      <Button size="sm" variant="ghost" onClick={onClear}>
        Tutup detail
      </Button>
    </div>
  );
}

function EdgeDetail({ edge, onClear }) {
  return (
    <div className="space-y-3">
      <div>
        <p className="text-[12px] font-medium uppercase tracking-[0.05em] text-muted">Sisi konflik</p>
        <h2 className="mt-1 font-mono text-sm font-medium">
          {edge.u} - {edge.v}
        </h2>
      </div>
      <div>
        <p className="text-[12px] text-muted">Dosen penyebab</p>
        <ul className="mt-1 space-y-1 text-sm">
          {edge.reason.lecturerNames.map((name) => (
            <li key={name}>{name}</li>
          ))}
        </ul>
      </div>
      <p className="text-[13px] leading-5 text-muted">
        Kedua mata kuliah tidak dapat berada pada kelompok warna yang sama.
      </p>
      <Button size="sm" variant="ghost" onClick={onClear}>
        Tutup detail
      </Button>
    </div>
  );
}

function CanvasSkeleton() {
  return (
    <div className="rounded-card border border-line bg-surface" aria-busy="true">
      <div className="h-[460px] p-6">
        <Skeleton className="h-full w-full" />
      </div>
      <span className="sr-only">Memuat kanvas graf</span>
    </div>
  );
}

export default function GraphPage() {
  const scope = useScope();
  const [conflictMode, setConflictMode] = useState(CONFLICT_MODE.LECTURER);
  const [selection, setSelection] = useState(null);
  const [layoutKey, setLayoutKey] = useState(0);

  const graphQuery = useGraph({ ...scope, conflictMode });
  const graph = graphQuery.data?.graph;

  const selectedVertex = useMemo(
    () =>
      selection?.type === 'node'
        ? graph?.vertices.find((vertex) => vertex.code === selection.code) ?? null
        : null,
    [selection, graph]
  );

  const selectedEdge = useMemo(
    () =>
      selection?.type === 'edge'
        ? graph?.edges.find((edge) => edge.id === selection.id) ?? null
        : null,
    [selection, graph]
  );

  const handleSelect = useCallback((next) => setSelection(next), []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Graf Konflik"
        description="Dua mata kuliah dihubungkan bila memiliki minimal satu dosen pengampu yang sama."
      />

      <ScopeBar scope={scope} />

      {scope.missing ? null : (
        <>
          <div className="flex flex-col gap-3 rounded-card border border-line bg-surface px-4 py-3 lg:flex-row lg:items-end">
            <div className="w-full lg:w-72">
              <label htmlFor="conflict-mode" className="mb-1.5 block text-[13px] font-medium text-ink">
                Mode konflik
              </label>
              <Select
                id="conflict-mode"
                value={conflictMode}
                onChange={(event) => {
                  setConflictMode(event.target.value);
                  setSelection(null);
                }}
              >
                <option value={CONFLICT_MODE.LECTURER}>
                  {CONFLICT_MODE_LABEL[CONFLICT_MODE.LECTURER]}
                </option>
              </Select>
            </div>
            <p className="flex-1 text-[13px] leading-5 text-muted">
              {CONFLICT_MODE_EXPLANATION[CONFLICT_MODE.LECTURER]}
            </p>
            <Button onClick={() => graphQuery.refetch()} loading={graphQuery.isFetching} size="md">
              Muat ulang
            </Button>
            <Button
              onClick={() => {
                setSelection(null);
                setLayoutKey((value) => value + 1);
              }}
              size="md"
            >
              Atur ulang tata letak
            </Button>
          </div>

          {graphQuery.isLoading ? (
            <CanvasSkeleton />
          ) : graphQuery.isError ? (
            <ErrorState error={graphQuery.error} onRetry={graphQuery.refetch} />
          ) : graph && graph.vertexCount === 0 ? (
            <div className="rounded-card border border-line bg-surface">
              <EmptyState
                title="Belum ada mata kuliah pada scope ini"
                description="Graf konflik dibentuk dari mata kuliah yang punya dosen pengampu. Tambahkan data terlebih dahulu."
              />
            </div>
          ) : graph ? (
            <>
              {graph.coursesWithoutLecturers.length > 0 ? (
                <Notice tone="warn" title="Ada mata kuliah tanpa dosen">
                  {graph.coursesWithoutLecturers.join(', ')} tidak akan memiliki sisi konflik karena
                  belum punya dosen pengampu.
                </Notice>
              ) : null}

              <div className="grid grid-cols-2 gap-px overflow-hidden rounded-card border border-line bg-line sm:grid-cols-4">
                <div className="bg-surface px-4 py-3">
                  <p className="text-[12px] text-muted">Simpul |V|</p>
                  <p className="mt-0.5 text-xl font-semibold tabular">{graph.vertexCount}</p>
                </div>
                <div className="bg-surface px-4 py-3">
                  <p className="text-[12px] text-muted">Sisi |E|</p>
                  <p className="mt-0.5 text-xl font-semibold tabular">{graph.edgeCount}</p>
                </div>
                <div className="bg-surface px-4 py-3">
                  <p className="text-[12px] text-muted">Simpul terisolasi</p>
                  <p className="mt-0.5 text-xl font-semibold tabular">{graph.isolatedCount}</p>
                </div>
                <div className="bg-surface px-4 py-3">
                  <p className="text-[12px] text-muted">Mode</p>
                  <p className="mt-0.5 text-sm font-medium">
                    {CONFLICT_MODE_LABEL[graph.conflictMode] ?? graph.conflictMode}
                  </p>
                </div>
              </div>

              <div className="grid gap-4 xl:grid-cols-[1fr_300px]">
                <div className="overflow-hidden rounded-card border border-line bg-surface">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-2.5">
                    <p className="text-[13px] font-medium">Kanvas graf</p>
                    <div className="flex items-center gap-4 text-[12px] text-muted">
                      <span className="inline-flex items-center gap-1.5">
                        <span className="h-2.5 w-2.5 rounded-sm border border-line bg-surface" />
                        Mata kuliah
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <span className="h-px w-5 bg-[#94a3b8]" />
                        Dosen sama
                      </span>
                    </div>
                  </div>
                  <div className="h-[520px]">
                    <ReactFlowProvider>
                      <GraphCanvas
                        key={layoutKey}
                        graph={graph}
                        selection={selection}
                        onSelect={handleSelect}
                      />
                    </ReactFlowProvider>
                  </div>
                </div>

                <aside className="rounded-card border border-line bg-surface">
                  <div className="border-b border-line px-4 py-3">
                    <h2 className="text-sm font-semibold">Detail</h2>
                    <p className="mt-0.5 text-[12px] text-muted">
                      Pilih simpul atau sisi pada kanvas.
                    </p>
                  </div>
                  <div className="px-4 py-4">
                    {selectedVertex ? (
                      <NodeDetail vertex={selectedVertex} onClear={() => setSelection(null)} />
                    ) : selectedEdge ? (
                      <EdgeDetail edge={selectedEdge} onClear={() => setSelection(null)} />
                    ) : (
                      <div className="space-y-2 text-[13px] leading-5 text-muted">
                        <p>
                          Simpul adalah mata kuliah. Derajat menunjukkan jumlah mata kuliah lain yang
                          berbagi dosen.
                        </p>
                        <p>
                          Simpul dengan derajat 0 tidak memiliki konflik dan tetap ikut diwarnai pada
                          tahap analisis.
                        </p>
                      </div>
                    )}
                  </div>
                </aside>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <section>
                  <div className="mb-2 flex items-center justify-between">
                    <h2 className="text-sm font-semibold">Daftar sisi</h2>
                    <Badge>{graph.edgeCount} sisi</Badge>
                  </div>
                  {graph.edges.length === 0 ? (
                    <div className="rounded-card border border-line bg-surface px-4 py-6 text-sm text-muted">
                      Tidak ada pasangan mata kuliah yang berbagi dosen pada scope ini.
                    </div>
                  ) : (
                    <Table minWidth="min-w-[420px]">
                      <THead>
                        <TR>
                          <TH className="w-[150px]">Pasangan</TH>
                          <TH>Dosen penyebab</TH>
                        </TR>
                      </THead>
                      <TBody>
                        {graph.edges.map((edge) => (
                          <TR key={edge.id}>
                            <TD className="font-mono text-[12px]">
                              {edge.u} - {edge.v}
                            </TD>
                            <TD className="text-[13px] text-muted">
                              {edge.reason.lecturerNames.join(', ')}
                            </TD>
                          </TR>
                        ))}
                      </TBody>
                    </Table>
                  )}
                </section>

                <section>
                  <div className="mb-2 flex items-center justify-between">
                    <h2 className="text-sm font-semibold">Derajat simpul</h2>
                    <Badge>{graph.vertexCount} simpul</Badge>
                  </div>
                  <Table minWidth="min-w-[420px]">
                    <THead>
                      <TR>
                        <TH className="w-[120px]">Kode</TH>
                        <TH>Mata kuliah</TH>
                        <TH className="w-[80px] text-right">Derajat</TH>
                      </TR>
                    </THead>
                    <TBody>
                      {[...graph.vertices]
                        .sort(
                          (a, b) => b.degree - a.degree || a.code.localeCompare(b.code, 'id')
                        )
                        .map((vertex) => (
                          <TR key={vertex.code}>
                            <TD className="font-mono text-[12px]">{vertex.code}</TD>
                            <TD className="text-[13px]">{vertex.name}</TD>
                            <TD className="text-right tabular">{vertex.degree}</TD>
                          </TR>
                        ))}
                    </TBody>
                  </Table>
                </section>
              </div>
            </>
          ) : null}
        </>
      )}
    </div>
  );
}
