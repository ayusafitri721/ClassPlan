import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  classInputSchema,
  semesterInputSchema,
  settingsSchema,
  TIE_BREAK_RULE_OPTIONS,
  CONFLICT_MODE,
  CONFLICT_MODE_EXPLANATION,
  CONFLICT_MODE_LABEL,
  TERM,
  TERM_LABEL,
  describeTieBreak,
} from '@classplan/shared';
import {
  useClassMutations,
  useClasses,
  useSemesterMutations,
  useSemesters,
  useSettings,
  useSettingsMutation,
} from '../hooks/queries.js';
import { PageHeader } from '../components/layout/PageHeader.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Input, Select, TextField } from '../components/ui/Form.jsx';
import { ConfirmDialog, Modal } from '../components/ui/Modal.jsx';
import {
  Badge,
  ErrorState,
  Notice,
  PageLoading,
  Skeleton,
  TableSkeleton,
} from '../components/ui/Feedback.jsx';
import { useToast } from '../components/ui/Toast.jsx';
import { Table, TBody, TD, TH, THead, TR } from '../components/ui/Table.jsx';
import { periodLabel } from '../lib/format.js';

function Section({ title, description, children, aside }) {
  return (
    <section className="rounded-card border border-line bg-surface">
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-line px-5 py-4">
        <div>
          <h2 className="text-base font-semibold">{title}</h2>
          {description ? (
            <p className="mt-0.5 max-w-2xl text-[13px] leading-5 text-muted">{description}</p>
          ) : null}
        </div>
        {aside}
      </header>
      <div className="px-5 py-5">{children}</div>
    </section>
  );
}

function SettingsForm({ settings }) {
  const mutation = useSettingsMutation();
  const toast = useToast();
  const [serverError, setServerError] = useState('');

  const currentRule =
    TIE_BREAK_RULE_OPTIONS.find(
      (option) => JSON.stringify(option.rule) === JSON.stringify(settings.tieBreakRule)
    )?.value ?? TIE_BREAK_RULE_OPTIONS[0].value;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      institutionName: settings.institutionName ?? '',
      studyProgram: settings.studyProgram ?? '',
      academicYear: settings.academicYear ?? '',
      term: settings.term ?? TERM.GANJIL,
      defaultConflictMode: CONFLICT_MODE.LECTURER,
      tieBreakRule: settings.tieBreakRule,
    },
  });

  const [ruleValue, setRuleValue] = useState(currentRule);

  const submit = handleSubmit(async (values) => {
    setServerError('');
    const rule =
      TIE_BREAK_RULE_OPTIONS.find((option) => option.value === ruleValue)?.rule ??
      TIE_BREAK_RULE_OPTIONS[0].rule;

    try {
      await mutation.mutateAsync({
        ...values,
        defaultConflictMode: CONFLICT_MODE.LECTURER,
        tieBreakRule: rule,
      });
      toast.push('Pengaturan disimpan.', 'success');
    } catch (error) {
      if (error.fields) {
        const [first] = Object.values(error.fields);
        setServerError(first);
      } else {
        setServerError(error.message);
      }
    }
  });

  return (
    <form onSubmit={submit} noValidate className="space-y-5">
      {serverError ? <Notice tone="danger">{serverError}</Notice> : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          name="institutionName"
          label="Nama institusi"
          error={errors.institutionName?.message}
          hint="Tampil pada header laporan."
        >
          <Input placeholder="Universitas" autoComplete="organization" {...register('institutionName')} />
        </TextField>

        <TextField
          name="studyProgram"
          label="Program studi"
          error={errors.studyProgram?.message}
          hint="Tampil pada laporan bila diisi."
        >
          <Input placeholder="Teknik Informatika" {...register('studyProgram')} />
        </TextField>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          name="academicYear"
          label="Tahun akademik aktif"
          error={errors.academicYear?.message}
          hint="Format 2026/2027. Boleh dikosongkan."
        >
          <Input placeholder="2026/2027" inputMode="numeric" {...register('academicYear')} />
        </TextField>

        <TextField name="term" label="Semester aktif" error={errors.term?.message}>
          <Select {...register('term')}>
            <option value={TERM.GANJIL}>{TERM_LABEL[TERM.GANJIL]}</option>
            <option value={TERM.GENAP}>{TERM_LABEL[TERM.GENAP]}</option>
          </Select>
        </TextField>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="tie-break" className="mb-1.5 block text-[13px] font-medium text-ink">
            Aturan pemecah seri default
          </label>
          <Select
            id="tie-break"
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
            Derajat selalu menjadi kriteria pertama. Urutan aktif:{' '}
            {describeTieBreak(
              TIE_BREAK_RULE_OPTIONS.find((option) => option.value === ruleValue)?.rule
            )}
            .
          </p>
        </div>

        <div>
          <span className="mb-1.5 block text-[13px] font-medium text-ink">Mode konflik default</span>
          <div className="rounded-md border border-line bg-canvas px-3 py-2">
            <p className="text-sm font-medium">{CONFLICT_MODE_LABEL[CONFLICT_MODE.LECTURER]}</p>
            <p className="mt-0.5 text-[13px] leading-5 text-muted">
              {CONFLICT_MODE_EXPLANATION[CONFLICT_MODE.LECTURER]}
            </p>
          </div>
          <p className="mt-1.5 text-[13px] leading-5 text-muted">
            {CONFLICT_MODE_EXPLANATION[CONFLICT_MODE.LECTURER_CLASS]}
          </p>
        </div>
      </div>

      <div className="flex justify-end gap-2 border-t border-line pt-4">
        <Button type="submit" variant="primary" loading={mutation.isPending}>
          Simpan pengaturan
        </Button>
      </div>
    </form>
  );
}

function ClassForm({ item, onClose }) {
  const { save } = useClassMutations();
  const toast = useToast();
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(classInputSchema),
    defaultValues: { name: item?.name ?? '', studyProgram: item?.studyProgram ?? '' },
  });

  const submit = handleSubmit(async (values) => {
    setServerError('');
    try {
      await save.mutateAsync({ id: item?.id, body: values });
      toast.push(item ? 'Kelas diperbarui.' : 'Kelas ditambahkan.', 'success');
      onClose();
    } catch (error) {
      setServerError(error.message);
    }
  });

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      {serverError ? <Notice tone="danger">{serverError}</Notice> : null}
      <TextField name="class-name" label="Nama kelas" required error={errors.name?.message}>
        <Input placeholder="Kelas A" {...register('name')} />
      </TextField>
      <TextField
        name="class-program"
        label="Program studi"
        required
        error={errors.studyProgram?.message}
      >
        <Input placeholder="Teknik Informatika" {...register('studyProgram')} />
      </TextField>
      <div className="flex flex-col-reverse gap-2 border-t border-line pt-4 sm:flex-row sm:justify-end">
        <Button onClick={onClose} disabled={save.isPending}>
          Batal
        </Button>
        <Button type="submit" variant="primary" loading={save.isPending}>
          Simpan
        </Button>
      </div>
    </form>
  );
}

function SemesterForm({ item, onClose }) {
  const { save } = useSemesterMutations();
  const toast = useToast();
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(semesterInputSchema),
    defaultValues: {
      academicYear: item?.academicYear ?? '',
      term: item?.term ?? TERM.GANJIL,
    },
  });

  const submit = handleSubmit(async (values) => {
    setServerError('');
    try {
      await save.mutateAsync({ id: item?.id, body: values });
      toast.push(item ? 'Semester diperbarui.' : 'Semester ditambahkan.', 'success');
      onClose();
    } catch (error) {
      setServerError(error.message);
    }
  });

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      {serverError ? <Notice tone="danger">{serverError}</Notice> : null}
      <TextField
        name="semester-year"
        label="Tahun akademik"
        required
        error={errors.academicYear?.message}
        hint="Format 2026/2027."
      >
        <Input placeholder="2026/2027" inputMode="numeric" {...register('academicYear')} />
      </TextField>
      <TextField name="semester-term" label="Semester" required error={errors.term?.message}>
        <Select {...register('term')}>
          <option value={TERM.GANJIL}>{TERM_LABEL[TERM.GANJIL]}</option>
          <option value={TERM.GENAP}>{TERM_LABEL[TERM.GENAP]}</option>
        </Select>
      </TextField>
      <div className="flex flex-col-reverse gap-2 border-t border-line pt-4 sm:flex-row sm:justify-end">
        <Button onClick={onClose} disabled={save.isPending}>
          Batal
        </Button>
        <Button type="submit" variant="primary" loading={save.isPending}>
          Simpan
        </Button>
      </div>
    </form>
  );
}

function ClassesSection() {
  const query = useClasses();
  const { remove } = useClassMutations();
  const toast = useToast();
  const [editing, setEditing] = useState(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState(null);

  const classes = query.data?.classes ?? [];

  return (
    <>
      <Section
        title="Kelas"
        description="Kelas dipakai sebagai cakupan analisis. Satu kelas berisi kumpulan mata kuliah pada satu semester."
        aside={
          <Button size="sm" onClick={() => setCreating(true)}>
            Tambah kelas
          </Button>
        }
      >
        {query.isLoading ? (
          <div className="space-y-2" aria-busy="true">
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
          </div>
        ) : query.isError ? (
          <ErrorState error={query.error} onRetry={query.refetch} />
        ) : classes.length === 0 ? (
          <div className="rounded-md border border-dashed border-line px-4 py-6 text-center">
            <p className="text-sm font-medium">Belum ada kelas</p>
            <p className="mt-1 text-[13px] text-muted">
              Tambahkan kelas sebelum mengisi mata kuliah.
            </p>
            <Button className="mt-4" variant="primary" onClick={() => setCreating(true)}>
              Tambah kelas
            </Button>
          </div>
        ) : (
          <Table minWidth="min-w-[420px]">
            <THead>
              <TR>
                <TH>Nama kelas</TH>
                <TH>Program studi</TH>
                <TH className="w-[100px] text-right">Mata kuliah</TH>
                <TH className="w-[150px] text-right">Aksi</TH>
              </TR>
            </THead>
            <TBody>
              {classes.map((item) => (
                <TR key={item.id}>
                  <TD className="font-medium">{item.name}</TD>
                  <TD className="text-[13px] text-muted">{item.studyProgram}</TD>
                  <TD className="text-right tabular text-muted">{item.courseCount}</TD>
                  <TD>
                    <div className="flex justify-end gap-1">
                      <Button size="sm" variant="ghost" onClick={() => setEditing(item)}>
                        Ubah
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-danger hover:bg-danger-soft hover:text-danger"
                        onClick={() => setDeleting(item)}
                      >
                        Hapus
                      </Button>
                    </div>
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        )}
      </Section>

      <Modal
        open={creating || Boolean(editing)}
        onClose={() => {
          setCreating(false);
          setEditing(null);
        }}
        title={editing ? 'Ubah kelas' : 'Tambah kelas'}
        size="sm"
      >
        {creating || editing ? (
          <ClassForm
            key={editing?.id ?? 'new'}
            item={editing}
            onClose={() => {
              setCreating(false);
              setEditing(null);
            }}
          />
        ) : null}
      </Modal>

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={async () => {
          try {
            await remove.mutateAsync(deleting.id);
            toast.push(`Kelas ${deleting.name} dihapus.`, 'success');
          } catch (error) {
            toast.push(error.message, 'error');
          }
          setDeleting(null);
        }}
        pending={remove.isPending}
        title="Hapus kelas"
        description={
          deleting
            ? `Kelas ${deleting.name} akan dihapus. Kelas yang masih memiliki mata kuliah atau riwayat analisis tidak dapat dihapus.`
            : ''
        }
      />
    </>
  );
}

function SemestersSection() {
  const query = useSemesters();
  const { remove } = useSemesterMutations();
  const toast = useToast();
  const [editing, setEditing] = useState(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState(null);

  const semesters = query.data?.semesters ?? [];

  return (
    <>
      <Section
        title="Semester"
        description="Setiap analisis terikat pada satu semester. Tahun akademik memakai format 2026/2027."
        aside={
          <Button size="sm" onClick={() => setCreating(true)}>
            Tambah semester
          </Button>
        }
      >
        {query.isLoading ? (
          <div className="space-y-2" aria-busy="true">
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
          </div>
        ) : query.isError ? (
          <ErrorState error={query.error} onRetry={query.refetch} />
        ) : semesters.length === 0 ? (
          <div className="rounded-md border border-dashed border-line px-4 py-6 text-center">
            <p className="text-sm font-medium">Belum ada semester</p>
            <p className="mt-1 text-[13px] text-muted">
              Tambahkan semester sebelum mengisi mata kuliah.
            </p>
            <Button className="mt-4" variant="primary" onClick={() => setCreating(true)}>
              Tambah semester
            </Button>
          </div>
        ) : (
          <Table minWidth="min-w-[420px]">
            <THead>
              <TR>
                <TH>Semester</TH>
                <TH>Periode</TH>
                <TH className="w-[100px] text-right">Mata kuliah</TH>
                <TH className="w-[150px] text-right">Aksi</TH>
              </TR>
            </THead>
            <TBody>
              {semesters.map((item) => (
                <TR key={item.id}>
                  <TD className="font-medium">{periodLabel(item.academicYear, item.term)}</TD>
                  <TD className="text-[13px] text-muted">
                    {item.academicYear} · {TERM_LABEL[item.term]}
                  </TD>
                  <TD className="text-right tabular text-muted">{item.courseCount}</TD>
                  <TD>
                    <div className="flex justify-end gap-1">
                      <Button size="sm" variant="ghost" onClick={() => setEditing(item)}>
                        Ubah
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-danger hover:bg-danger-soft hover:text-danger"
                        onClick={() => setDeleting(item)}
                      >
                        Hapus
                      </Button>
                    </div>
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        )}
      </Section>

      <Modal
        open={creating || Boolean(editing)}
        onClose={() => {
          setCreating(false);
          setEditing(null);
        }}
        title={editing ? 'Ubah semester' : 'Tambah semester'}
        size="sm"
      >
        {creating || editing ? (
          <SemesterForm
            key={editing?.id ?? 'new'}
            item={editing}
            onClose={() => {
              setCreating(false);
              setEditing(null);
            }}
          />
        ) : null}
      </Modal>

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={async () => {
          try {
            await remove.mutateAsync(deleting.id);
            toast.push('Semester dihapus.', 'success');
          } catch (error) {
            toast.push(error.message, 'error');
          }
          setDeleting(null);
        }}
        pending={remove.isPending}
        title="Hapus semester"
        description={
          deleting
            ? `${periodLabel(deleting.academicYear, deleting.term)} akan dihapus. Semester yang masih memiliki mata kuliah atau riwayat analisis tidak dapat dihapus.`
            : ''
        }
      />
    </>
  );
}

export default function SettingsPage() {
  const settingsQuery = useSettings();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pengaturan"
        description="Identitas institusi, aturan analisis default, serta data kelas dan semester."
      />

      {settingsQuery.isLoading ? (
        <PageLoading label="Memuat pengaturan" />
      ) : settingsQuery.isError ? (
        <ErrorState error={settingsQuery.error} onRetry={settingsQuery.refetch} />
      ) : settingsQuery.data?.settings ? (
        <>
          <Section
            title="Identitas dan aturan analisis"
            description="Nilai ini dipakai sebagai default saat menjalankan analisis dan dicetak pada laporan."
            aside={<Badge tone="accent">Default</Badge>}
          >
            <SettingsForm settings={settingsQuery.data.settings} />
          </Section>

          <ClassesSection />
          <SemestersSection />
        </>
      ) : (
        <TableSkeleton rows={3} columns={2} />
      )}
    </div>
  );
}
