import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { loginSchema } from '@classplan/shared';
import { login } from '../api/endpoints.js';
import { useMe } from '../hooks/queries.js';
import { Input, TextField } from '../components/ui/Form.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Notice, PageLoading } from '../components/ui/Feedback.jsx';

export default function LoginPage() {
  const me = useMe();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [serverError, setServerError] = useState('');

  const mutation = useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      queryClient.setQueryData(['me'], data);
      const target = location.state?.from ?? '/';
      navigate(target, { replace: true });
    },
    onError: (error) => setServerError(error.message),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  if (me.isLoading) return <PageLoading label="Memeriksa sesi" />;
  if (me.isSuccess) return <Navigate to="/" replace />;

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
      <section className="hidden bg-navy px-12 py-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div>
          <p className="text-[20px] font-semibold">ClassPlan</p>
          <p className="mt-1 text-sm text-nav">Analisis penjadwalan perkuliahan</p>
        </div>

        <div className="max-w-md">
          <p className="text-[28px] font-semibold leading-9">
            Membentuk kelompok mata kuliah dari graf konflik.
          </p>
          <p className="mt-3 text-sm leading-6 text-nav">
            ClassPlan membentuk graf dari kesamaan dosen pengampu, menjalankan Welch Powell,
            lalu menampilkan setiap langkah pewarnaan beserta hasil validasinya.
          </p>
          <ul className="mt-6 space-y-2.5 text-sm text-nav">
            <li>Data mata kuliah, dosen, kelas, dan semester.</li>
            <li>Graf konflik dengan derajat dan alasan konflik.</li>
            <li>Kelompok warna, riwayat analisis, dan laporan.</li>
          </ul>
        </div>

        <p className="text-xs text-nav/80">
          Kelompok warna bukan jadwal hari, jam, atau ruang.
        </p>
      </section>

      <section className="flex items-center justify-center px-5 py-10">
        <div className="w-full max-w-sm">
          <p className="text-lg font-semibold lg:hidden">ClassPlan</p>
          <h1 className="mt-2 text-xl font-semibold lg:mt-0">Masuk ke ClassPlan</h1>
          <p className="mt-1 text-sm text-muted">
            Gunakan akun admin yang dibuat saat penyiapan data.
          </p>

          {serverError ? (
            <div className="mt-5">
              <Notice tone="danger">{serverError}</Notice>
            </div>
          ) : null}

          <form
            className="mt-6 space-y-4"
            onSubmit={handleSubmit((values) => {
              setServerError('');
              mutation.mutate(values);
            })}
            noValidate
          >
            <TextField name="email" label="Email" required error={errors.email?.message}>
              <Input
                type="email"
                autoComplete="email"
                placeholder="nama@institusi.ac.id"
                {...register('email')}
              />
            </TextField>

            <TextField name="password" label="Kata sandi" required error={errors.password?.message}>
              <Input
                type="password"
                autoComplete="current-password"
                placeholder="Kata sandi"
                {...register('password')}
              />
            </TextField>

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              loading={mutation.isPending}
            >
              Masuk
            </Button>
          </form>
        </div>
      </section>
    </div>
  );
}
