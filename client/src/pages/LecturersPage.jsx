import { Fragment, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { lecturerInputSchema } from '@classplan/shared';
import { Link, useLocation } from 'react-router-dom';
import { useLecturerMutations, useLecturers } from '../hooks/queries.js';
import { PageHeader } from '../components/layout/PageHeader.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Input, TextField } from '../components/ui/Form.jsx';
import { ConfirmDialog, Modal } from '../components/ui/Modal.jsx';
import { EmptyState, ErrorState, Notice, TableSkeleton } from '../components/ui/Feedback.jsx';
import { Table, TBody, TD, TH, THead, TR } from '../components/ui/Table.jsx';
import { useToast } from '../components/ui/Toast.jsx';
import { plural } from '../lib/format.js';

function LecturerForm({ lecturer, onClose, onSaved }) {
  const { save } = useLecturerMutations();
  const toast = useToast();
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(lecturerInputSchema),
    defaultValues: {
      name: lecturer?.name ?? '',
      lecturerCode: lecturer?.lecturerCode ?? '',
    },
  });

  const submit = handleSubmit(async (values) => {
    setServerError('');
    try {
      await save.mutateAsync({ id: lecturer?.id, body: values });
      toast.push(lecturer ? 'Data dosen diperbarui.' : 'Dosen ditambahkan.', 'success');
      onSaved();
    } catch (error) {
      if (error.fields) {
        Object.entries(error.fields).forEach(([field, message]) => {
          setError(field, { message });
        });
      } else {
        setServerError(error.message);
      }
    }
  });

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      {serverError ? <Notice tone="danger">{serverError}</Notice> : null}

      <TextField name="name" label="Nama dosen" required error={errors.name?.message}>
        <Input placeholder="Nama lengkap dengan gelar" autoComplete="off" {...register('name')} />
      </TextField>

      <TextField
        name="lecturerCode"
        label="NIDN atau NIP"
        error={errors.lecturerCode?.message}
        hint="Boleh dikosongkan bila belum tersedia."
      >
        <Input placeholder="Opsional" autoComplete="off" {...register('lecturerCode')} />
      </TextField>

      <div className="flex flex-col-reverse gap-2 border-t border-line pt-4 sm:flex-row sm:justify-end">
        <Button onClick={onClose} disabled={save.isPending}>
          Batal
        </Button>
        <Button type="submit" variant="primary" loading={save.isPending}>
          {lecturer ? 'Simpan perubahan' : 'Tambah dosen'}
        </Button>
      </div>
    </form>
  );
}

export default function LecturersPage() {
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [expanded, setExpanded] = useState(null);
  const { remove } = useLecturerMutations();
  const toast = useToast();
  const location = useLocation();

  const lecturersQuery = useLecturers(search.trim());
  const lecturers = lecturersQuery.data?.lecturers ?? [];

  const closeForm = () => {
    setEditing(null);
    setCreating(false);
  };

  const confirmDelete = async () => {
    try {
      await remove.mutateAsync(deleting.id);
      toast.push(`Dosen ${deleting.name} dihapus.`, 'success');
      setDeleting(null);
    } catch (error) {
      toast.push(error.message, 'error');
      setDeleting(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dosen"
        description="Data dosen yang dapat dihubungkan ke mata kuliah sebagai pengampu."
        actions={
          <Button variant="primary" onClick={() => setCreating(true)}>
            Tambah dosen
          </Button>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="w-full sm:max-w-xs">
          <label htmlFor="lecturer-search" className="sr-only">
            Cari dosen
          </label>
          <Input
            id="lecturer-search"
            type="search"
            placeholder="Cari nama atau NIDN/NIP"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        <p className="text-[13px] text-muted tabular">{plural(lecturers.length, 'dosen', 'dosen')}</p>
      </div>

      {lecturersQuery.isLoading ? (
        <TableSkeleton rows={6} columns={4} />
      ) : lecturersQuery.isError ? (
        <ErrorState error={lecturersQuery.error} onRetry={lecturersQuery.refetch} />
      ) : lecturers.length === 0 ? (
        <div className="rounded-card border border-line bg-surface">
          {search ? (
            <EmptyState
              title="Pencarian tidak menemukan hasil"
              description={`Tidak ada dosen yang cocok dengan "${search}".`}
              action={<Button onClick={() => setSearch('')}>Hapus pencarian</Button>}
            />
          ) : (
            <EmptyState
              title="Belum ada data dosen"
              description="Tambahkan dosen agar dapat dihubungkan ke mata kuliah."
              action={
                <Button variant="primary" onClick={() => setCreating(true)}>
                  Tambah dosen
                </Button>
              }
            />
          )}
        </div>
      ) : (
        <Table minWidth="min-w-[680px]">
          <THead>
            <TR>
              <TH>Nama</TH>
              <TH className="w-[180px]">NIDN/NIP</TH>
              <TH className="w-[170px]">Mata kuliah</TH>
              <TH className="w-[220px] text-right">Aksi</TH>
            </TR>
          </THead>
          <TBody>
            {lecturers.map((lecturer) => {
              const isOpen = expanded === lecturer.id;
              return (
                <Fragment key={lecturer.id}>
                  <TR>
                    <TD className="font-medium">{lecturer.name}</TD>
                    <TD className="font-mono text-[13px] text-muted">
                      {lecturer.lecturerCode || '-'}
                    </TD>
                    <TD className="tabular text-muted">
                      {plural(lecturer.courses.length, 'mata kuliah', 'mata kuliah')}
                    </TD>
                    <TD>
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setExpanded(isOpen ? null : lecturer.id)}
                          aria-expanded={isOpen}
                        >
                          {isOpen ? 'Tutup' : 'Lihat'}
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setEditing(lecturer)}>
                          Ubah
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-danger hover:bg-danger-soft hover:text-danger"
                          onClick={() => setDeleting(lecturer)}
                        >
                          Hapus
                        </Button>
                      </div>
                    </TD>
                  </TR>
                  {isOpen ? (
                    <TR className="bg-canvas">
                      <TD>{null}</TD>
                      <TD className="text-[13px] text-muted">Mengampu</TD>
                      <TD>
                        {lecturer.courses.length === 0 ? (
                          <span className="text-[13px] text-muted">Belum mengampu mata kuliah.</span>
                        ) : (
                          <ul className="space-y-1.5 text-[13px]">
                            {lecturer.courses.map((course) => (
                              <li key={course.id} className="flex flex-wrap items-baseline gap-2">
                                <span className="font-mono text-[12px] font-medium">
                                  {course.code}
                                </span>
                                <span>{course.name}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </TD>
                      <TD className="text-right">
                        <Link
                          to={{ pathname: '/courses', search: location.search }}
                          className="text-[13px] font-medium text-accent underline underline-offset-2"
                        >
                          Buka mata kuliah
                        </Link>
                      </TD>
                    </TR>
                  ) : null}
                </Fragment>
              );
            })}
          </TBody>
        </Table>
      )}

      <Modal
        open={creating || Boolean(editing)}
        onClose={closeForm}
        title={editing ? 'Ubah data dosen' : 'Tambah dosen'}
        size="sm"
      >
        {creating || editing ? (
          <LecturerForm
            key={editing?.id ?? 'new'}
            lecturer={editing}
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
        title="Hapus dosen"
        description={
          deleting
            ? `${deleting.name} akan dihapus. Dosen yang masih terhubung ke mata kuliah tidak dapat dihapus.`
            : ''
        }
      />
    </div>
  );
}
