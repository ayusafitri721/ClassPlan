import { Link } from 'react-router-dom';
import { Select } from '../ui/Form.jsx';
import { Notice, Skeleton } from '../ui/Feedback.jsx';
import { classLabel, periodLabel } from '../../lib/format.js';

export function ScopeBar({ scope }) {
  if (scope.isLoading) {
    return (
      <div className="rounded-card border border-line bg-surface px-4 py-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <Skeleton className="h-10 w-full sm:w-56" />
          <Skeleton className="h-10 w-full sm:w-56" />
        </div>
      </div>
    );
  }

  if (scope.missing) {
    return (
      <Notice tone="warn" title="Kelas atau semester belum tersedia">
        Tambahkan minimal satu kelas dan satu semester di halaman{' '}
        <Link to="/settings" className="font-medium underline underline-offset-2">
          Pengaturan
        </Link>{' '}
        sebelum melanjutkan.
      </Notice>
    );
  }

  return (
    <div className="rounded-card border border-line bg-surface px-4 py-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="w-full sm:w-56">
          <label
            htmlFor="scope-class"
            className="mb-1.5 block text-[13px] font-medium text-ink"
          >
            Kelas
          </label>
          <Select
            id="scope-class"
            value={scope.classId ?? ''}
            onChange={(event) => scope.setScope({ classId: Number(event.target.value) })}
          >
            {scope.classList.map((item) => (
              <option key={item.id} value={item.id}>
                {classLabel(item)}
              </option>
            ))}
          </Select>
        </div>

        <div className="w-full sm:w-60">
          <label
            htmlFor="scope-semester"
            className="mb-1.5 block text-[13px] font-medium text-ink"
          >
            Semester
          </label>
          <Select
            id="scope-semester"
            value={scope.semesterId ?? ''}
            onChange={(event) => scope.setScope({ semesterId: Number(event.target.value) })}
          >
            {scope.semesterList.map((item) => (
              <option key={item.id} value={item.id}>
                {periodLabel(item.academicYear, item.term)}
              </option>
            ))}
          </Select>
        </div>

        {scope.activeClass ? (
          <p className="text-[13px] text-muted sm:mb-2.5 sm:ml-1">
            {scope.activeClass.studyProgram}
          </p>
        ) : null}
      </div>
    </div>
  );
}
