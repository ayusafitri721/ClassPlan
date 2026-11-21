import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { courseInputSchema, DAY, DAY_LABEL } from '@classplan/shared';
import { useCourseMutations, useCourses, useLecturers } from '../hooks/queries.js';
import { useScope } from '../hooks/useScope.js';
import { PageHeader } from '../components/layout/PageHeader.jsx';
import { ScopeBar } from '../components/layout/ScopeBar.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Input, Select, TextField } from '../components/ui/Form.jsx';
import { ConfirmDialog, Modal } from '../components/ui/Modal.jsx';
import { Badge, EmptyState, ErrorState, Notice, TableSkeleton } from '../components/ui/Feedback.jsx';
import { Table, TBody, TD, TH, THead, TR } from '../components/ui/Table.jsx';
import { useToast } from '../components/ui/Toast.jsx';
import { formatSchedule, lecturerNames, periodLabel } from '../lib/format.js';

function CourseForm({ course, scope, lecturers, onClose, onSaved }) {
  const { save } = useCourseMutations();
  const toast = useToast();
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    setError,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(courseInputSchema),
    defaultValues: {
      code: course?.code ?? '',
      name: course?.name ?? '',
      credits: course?.credits ?? 2,
      classId: course?.classId ?? scope.classId,
      semesterId: course?.semesterId ?? scope.semesterId,
      lecturerIds: course?.lecturers?.map((lecturer) => lecturer.id) ?? [],
      dayOfWeek: course?.dayOfWeek ?? '',
      startTime: course?.startTime?.slice(0, 5) ?? '',
      endTime: course?.endTime?.slice(0, 5) ?? '',
    },
  });

  const submit = handleSubmit(async (values) => {
    setServerError('');
    try {
      await save.mutateAsync({ id: course?.id, body: values });
      toast.push(course ? 'Mata kuliah diperbarui.' : 'Mata kuliah ditambahkan.', 'success');
      onSaved();
    } catch (error) {
      if (error.fields) {
        Object.entries(error.fields).forEach(([field, message]) => {
          if (field === 'lecturerIds') setServerError(message);
          else setError(field, { message });
        });
      } else {
        setServerError(error.message);
      }
    }
  });

  return (
    <form id="course-form" onSubmit={submit} noValidate className="space-y-4">
      {serverError ? <Notice tone="danger">{serverError}</Notice> : null}

      <div className="grid gap-4 sm:grid-cols-[160px_1fr]">
        <TextField name="code" label="Kode" required error={errors.code?.message}>
          <Input placeholder="MD" autoComplete="off" {...register('code')} />
        </TextField>

        <TextField name="name" label="Nama mata kuliah" required error={errors.name?.message}>
          <Input placeholder="Matematika Diskrit" autoComplete="off" {...register('name')} />
        </TextField>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <TextField name="credits" label="SKS" required error={errors.credits?.message}>
          <Input type="number" min="1" max="12" inputMode="numeric" {...register('credits')} />
        </TextField>

        <TextField name="classId" label="Kelas" required error={errors.classId?.message}>
          <Select {...register('classId')}>
            {scope.classList.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </Select>
        </TextField>

        <TextField name="semesterId" label="Semester" required error={errors.semesterId?.message}>
          <Select {...register('semesterId')}>
            {scope.semesterList.map((item) => (
              <option key={item.id} value={item.id}>
                {periodLabel(item.academicYear, item.term)}
              </option>
            ))}
          </Select>
        </TextField>
      </div>

      <fieldset className="rounded-md border border-line bg-canvas px-3 py-3">
        <legend className="px-1 text-[13px] font-medium text-ink">
          Jadwal kuliah <span className="font-normal text-muted">(opsional, metadata)</span>
        </legend>
        <div className="grid gap-3 sm:grid-cols-3">
          <TextField
            name="dayOfWeek"
            label="Hari"
            error={errors.dayOfWeek?.message}
            hint="Boleh dikosongkan."
          >
            <Select {...register('dayOfWeek')}>
              <option value="">Tidak ditentukan</option>
              {Object.values(DAY).map((day) => (
                <option key={day} value={day}>
                  {DAY_LABEL[day]}
                </option>
              ))}
            </Select>
          </TextField>
          <TextField name="startTime" label="Mulai" error={errors.startTime?.message}>
            <Input type="time" {...register('startTime')} />
          </TextField>
          <TextField name="endTime" label="Selesai" error={errors.endTime?.message}>
            <Input type="time" {...register('endTime')} />
          </TextField>
        </div>
        <p className="mt-2 text-[13px] leading-5 text-muted">
          Jadwal hanya untuk keterangan laporan. Konflik tetap dihitung dari kesamaan dosen.
        </p>
      </fieldset>

      <Controller
        control={control}
        name="lecturerIds"
        render={({ field }) => {
          const selected = field.value ?? [];
          return (
            <fieldset>
              <legend className="mb-1.5 text-[13px] font-medium text-ink">
                Dosen pengampu
                <span className="ml-1 font-normal text-muted">({selected.length} dipilih)</span>
              </legend>
              <div className="max-h-56 overflow-y-auto rounded-md border border-line bg-surface">
                {lecturers.length === 0 ? (
                  <p className="px-3 py-4 text-[13px] text-muted">
                    Belum ada data dosen. Tambahkan dosen terlebih dahulu.
                  </p>
                ) : (
                  <ul className="divide-y divide-line">
                    {lecturers.map((lecturer) => (
                      <li key={lecturer.id}>
                        <label className="flex min-h-11 cursor-pointer items-center gap-3 px-3 py-2 hover:bg-canvas">
                          <input
                            type="checkbox"
                            value={lecturer.id}
                            className="h-4 w-4 accent-[#1d4ed8]"
                            checked={selected.includes(lecturer.id)}
                            onChange={(event) => {
                              const next = event.target.checked
                                ? [...selected, lecturer.id]
                                : selected.filter((id) => id !== lecturer.id);
                              field.onChange(next);
                            }}
                          />
                          <span className="min-w-0 flex-1 text-sm">{lecturer.name}</span>
                          {lecturer.lecturerCode ? (
                            <span className="font-mono text-[12px] text-muted">
                              {lecturer.lecturerCode}
                            </span>
                          ) : null}
                        </label>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              {errors.lecturerIds ? (
                <p className="mt-1.5 text-[13px] text-danger">{errors.lecturerIds.message}</p>
              ) : null}
              <p className="mt-1.5 text-[13px] text-muted">
                Dua mata kuliah dianggap berkonflik bila memiliki minimal satu dosen yang sama.
              </p>
            </fieldset>
          );
        }}
      />

      <div className="flex flex-col-reverse gap-2 border-t border-line pt-4 sm:flex-row sm:justify-end">
        <Button onClick={onClose} disabled={save.isPending}>
          Batal
        </Button>
        <Button type="submit" variant="primary" loading={save.isPending}>
          {course ? 'Simpan perubahan' : 'Tambah mata kuliah'}
        </Button>
      </div>
    </form>
  );
}

export default function CoursesPage() {
  const scope = useScope();
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const { remove } = useCourseMutations();
  const toast = useToast();

  const lecturersQuery = useLecturers();
  const coursesQuery = useCourses(scope);

  const lecturers = lecturersQuery.data?.lecturers ?? [];
  const courses = coursesQuery.data?.courses ?? [];
  const term = search.trim().toLowerCase();
  const visible = term
    ? courses.filter(
        (course) =>
          course.code.toLowerCase().includes(term) ||
          course.name.toLowerCase().includes(term)
      )
    : courses;

  const closeForm = () => {
    setEditing(null);
    setCreating(false);
  };

  const confirmDelete = async () => {
    try {
      await remove.mutateAsync(deleting.id);
      toast.push(`Mata kuliah ${deleting.code} dihapus.`, 'success');
      setDeleting(null);
    } catch (error) {
      toast.push(error.message, 'error');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mata Kuliah"
        description="Data mata kuliah pada kelas dan semester terpilih, beserta dosen pengampunya."
        actions={
          <Button
            variant="primary"
            onClick={() => setCreating(true)}
            disabled={scope.missing || scope.isLoading}
          >
            Tambah mata kuliah
          </Button>
        }
      />

      <ScopeBar scope={scope} />

      {scope.missing ? null : (
        <>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="w-full sm:max-w-xs">
              <label htmlFor="course-search" className="sr-only">
                Cari mata kuliah
              </label>
              <Input
                id="course-search"
                type="search"
                placeholder="Cari kode atau nama"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
            <p className="text-[13px] text-muted tabular">
              {visible.length} dari {courses.length} mata kuliah
            </p>
          </div>

          {coursesQuery.isLoading ? (
            <TableSkeleton rows={6} columns={5} />
          ) : coursesQuery.isError ? (
            <ErrorState error={coursesQuery.error} onRetry={coursesQuery.refetch} />
          ) : courses.length === 0 ? (
            <div className="rounded-card border border-line bg-surface">
              <EmptyState
                title="Belum ada mata kuliah"
                description="Tambahkan mata kuliah untuk kelas dan semester ini, lalu hubungkan dosen pengampu."
                action={
                  <Button variant="primary" onClick={() => setCreating(true)}>
                    Tambah mata kuliah
                  </Button>
                }
              />
            </div>
          ) : visible.length === 0 ? (
            <div className="rounded-card border border-line bg-surface">
              <EmptyState
                title="Pencarian tidak menemukan hasil"
                description={`Tidak ada mata kuliah yang cocok dengan "${search}". Coba kata kunci lain.`}
                action={<Button onClick={() => setSearch('')}>Hapus pencarian</Button>}
              />
            </div>
          ) : (
            <Table minWidth="min-w-[980px]">
              <THead>
                <TR>
                  <TH className="sticky left-0 z-10 w-[110px] border-r border-line bg-canvas">Kode</TH>
                  <TH>Nama</TH>
                  <TH className="w-[64px] text-right">SKS</TH>
                  <TH className="w-[150px]">Kelas</TH>
                  <TH className="w-[170px]">Semester</TH>
                  <TH className="w-[150px]">Jadwal</TH>
                  <TH>Dosen</TH>
                  <TH className="w-[130px] text-right">Aksi</TH>
                </TR>
              </THead>
              <TBody>
                {visible.map((course) => (
                  <TR key={course.id}>
                    <TD className="sticky left-0 z-10 border-r border-line bg-surface font-mono text-[13px] font-medium">{course.code}</TD>
                    <TD className="font-medium">{course.name}</TD>
                    <TD className="text-right tabular">{course.credits}</TD>
                    <TD className="text-muted">{course.className}</TD>
                    <TD className="text-muted">
                      {periodLabel(course.academicYear, course.term)}
                    </TD>
                    <TD className="text-[13px] text-muted">{formatSchedule(course)}</TD>
                    <TD>
                      {course.lecturers.length === 0 ? (
                        <Badge tone="warn">Belum ada dosen</Badge>
                      ) : (
                        <span className="text-[13px] text-muted">
                          {lecturerNames(course.lecturers)}
                        </span>
                      )}
                    </TD>
                    <TD>
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm" onClick={() => setEditing(course)}>
                          Ubah
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-danger hover:bg-danger-soft hover:text-danger"
                          onClick={() => setDeleting(course)}
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
        </>
      )}

      <Modal
        open={creating || Boolean(editing)}
        onClose={closeForm}
        title={editing ? `Ubah ${editing.code}` : 'Tambah mata kuliah'}
        description="Kode mata kuliah harus unik dalam satu kelas dan semester."
        size="lg"
      >
        {creating || editing ? (
          <CourseForm
            key={editing?.id ?? 'new'}
            course={editing}
            scope={scope}
            lecturers={lecturers}
            onClose={closeForm}
            onSaved={closeForm}
          />
        ) : null}
      </Modal>

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={confirmDelete}
        pending={remove.isPending}
        title="Hapus mata kuliah"
        description={
          deleting
            ? `${deleting.code} ${deleting.name} akan dihapus. Riwayat analisis yang sudah ada tetap tersimpan karena memakai snapshot.`
            : ''
        }
      />
    </div>
  );
}
