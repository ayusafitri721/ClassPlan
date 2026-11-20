import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { logout } from '../../api/endpoints.js';
import { useMe } from '../../hooks/queries.js';
import { Button } from '../ui/Button.jsx';

const NAV = [
  {
    section: 'Ringkasan',
    items: [{ to: '/', label: 'Dashboard' }],
  },
  {
    section: 'Data',
    items: [
      { to: '/courses', label: 'Mata Kuliah' },
      { to: '/lecturers', label: 'Dosen' },
    ],
  },
  {
    section: 'Analisis',
    items: [
      { to: '/graph', label: 'Graf Konflik' },
      { to: '/analysis', label: 'Welch Powell' },
      { to: '/results', label: 'Hasil Pengelompokan' },
    ],
  },
  {
    section: 'Laporan',
    items: [{ to: '/report', label: 'Laporan' }],
  },
];

const TITLES = {
  '/': 'Dashboard',
  '/courses': 'Mata Kuliah',
  '/lecturers': 'Dosen',
  '/graph': 'Graf Konflik',
  '/analysis': 'Welch Powell',
  '/results': 'Hasil Pengelompokan',
  '/report': 'Laporan',
  '/settings': 'Pengaturan',
};

function pageTitle(pathname) {
  if (TITLES[pathname]) return TITLES[pathname];
  if (pathname.startsWith('/results')) return 'Hasil Pengelompokan';
  if (pathname.startsWith('/report')) return 'Laporan';
  return 'ClassPlan';
}

function navClass(active) {
  return [
    'flex min-h-11 items-center rounded-md border-l-2 px-3 text-sm transition-colors lg:min-h-10',
    active
      ? 'border-white bg-white/10 font-medium text-white'
      : 'border-transparent text-nav hover:bg-white/5 hover:text-white',
  ].join(' ');
}

function SidebarContent({ onNavigate, onClose }) {
  const location = useLocation();

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-start justify-between gap-3 px-5 pb-5 pt-5">
        <Link to={{ pathname: '/', search: location.search }} className="block text-white">
          <span className="text-[18px] font-semibold tracking-[-0.01em]">ClassPlan</span>
          <span className="mt-0.5 block text-[12px] text-nav">
            Analisis jadwal perkuliahan
          </span>
        </Link>
        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            className="-mr-2 flex h-10 w-10 items-center justify-center rounded-md text-nav hover:bg-white/10 hover:text-white"
            aria-label="Tutup navigasi"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
              <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </button>
        ) : null}
      </div>

      <nav className="flex-1 overflow-y-auto px-2 pb-4" aria-label="Navigasi utama">
        {NAV.map((group) => (
          <div key={group.section} className="mb-4">
            <p className="px-3 pb-1.5 text-[12px] text-nav/70">{group.section}</p>
            <ul className="space-y-0.5">
              {group.items.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={{ pathname: item.to, search: location.search }}
                    end={item.to === '/'}
                    className={({ isActive }) => navClass(isActive)}
                    onClick={onNavigate}
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-white/10 px-2 py-3">
        <Link
          to={{ pathname: '/settings', search: location.search }}
          className={navClass(location.pathname === '/settings')}
          onClick={onNavigate}
        >
          Pengaturan
        </Link>
      </div>
    </div>
  );
}

export function AppShell() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const me = useMe();

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.clear();
      navigate('/login', { replace: true });
    },
  });

  useEffect(() => {
    setDrawerOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!drawerOpen) return undefined;
    const onKey = (event) => {
      if (event.key === 'Escape') setDrawerOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [drawerOpen]);

  return (
    <div className="min-h-screen lg:pl-[248px] print:pl-0">
      <aside className="no-print sidebar fixed inset-y-0 left-0 z-40 hidden w-[248px] bg-navy lg:block">
        <SidebarContent />
      </aside>

      {drawerOpen ? (
        <div className="no-print fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-[#0f172a]/50"
            onMouseDown={() => setDrawerOpen(false)}
            aria-hidden="true"
          />
          <aside
            className="sidebar relative h-full w-[264px] bg-navy shadow-xl"
            role="dialog"
            aria-modal="true"
            aria-label="Navigasi utama"
          >
            <SidebarContent
              onNavigate={() => setDrawerOpen(false)}
              onClose={() => setDrawerOpen(false)}
            />
          </aside>
        </div>
      ) : null}

      <header className="no-print sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-line bg-surface px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-md border border-line text-ink lg:hidden"
          onClick={() => setDrawerOpen(true)}
          aria-label="Buka navigasi"
          aria-expanded={drawerOpen}
        >
          <svg width="18" height="14" viewBox="0 0 18 14" aria-hidden="true">
            <path d="M0 1h18M0 7h18M0 13h18" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </button>

        <div className="hidden text-[13px] sm:block">
          <Link to={{ pathname: '/', search: location.search }} className="text-muted hover:text-ink">
            ClassPlan
          </Link>
          <span className="mx-2 text-line">/</span>
          <span className="font-medium text-ink">{pageTitle(location.pathname)}</span>
        </div>

        <div className="ml-auto flex items-center gap-3">
          <span className="hidden max-w-[180px] truncate text-[13px] text-muted sm:block">
            {me.data?.user?.name}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => logoutMutation.mutate()}
            loading={logoutMutation.isPending}
          >
            Keluar
          </Button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8 print:max-w-none print:p-0">
        <Outlet />
      </main>
    </div>
  );
}
