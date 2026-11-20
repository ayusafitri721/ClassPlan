import { Link } from 'react-router-dom';
import { buttonClass } from '../components/ui/Button.jsx';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="max-w-md text-center">
        <p className="font-mono text-[13px] text-muted">404</p>
        <h1 className="mt-2 text-2xl font-semibold">Halaman tidak ditemukan</h1>
        <p className="mt-2 text-sm text-muted">
          Alamat yang kamu buka tidak ada, atau sudah dipindahkan.
        </p>
        <Link to="/" className={`${buttonClass({ variant: 'primary' })} mt-6`}>
          Kembali ke dashboard
        </Link>
      </div>
    </div>
  );
}
