import { Link, Outlet, useNavigate } from 'react-router-dom';
import ThemeToggle from '../../components/ThemeToggle';
import AppNav from '../../components/AppNav';
import { useAuth } from '../../contexts/AuthContext';
import PrimaryButton from '../../components/PrimaryButton';

const AppLayout = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-100/80 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100">
      <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Link to="/app/home" className="flex items-center gap-2 text-lg font-semibold text-primary">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">SF</span>
              <div className="text-left">
                <p>Sankofa Member</p>
                <p className="text-xs font-normal text-slate-500 dark:text-slate-400">Empowering community savings</p>
              </div>
            </Link>
            <div className="flex items-center gap-4">
              <div className="hidden text-right sm:block">
                <p className="text-sm font-semibold">{user?.fullName || 'Loading...'}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {user?.kycStatus === 'verified' ? 'Verified Member' : user?.kycStatus || 'Pending'}
                </p>
              </div>
              <div className="relative">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white font-semibold shadow-lg shadow-primary/20">
                  {user?.fullName?.charAt(0).toUpperCase() || 'U'}
                </div>
                {user?.kycStatus === 'verified' && (
                  <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900"></div>
                )}
              </div>
              <ThemeToggle />
            </div>
          </div>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <AppNav />
            <PrimaryButton label="Back to landing" onClick={() => navigate('/')} />
          </div>
        </div>
      </header>
      <main className="mx-auto flex max-w-6xl flex-1 flex-col gap-8 px-4 py-10">
        <Outlet />
      </main>
      <footer className="border-t border-slate-200 bg-white/70 py-6 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Sankofa Cooperative. All rights reserved.</p>
          <div className="flex items-center gap-3">
            <Link to="/app/support" className="hover:text-primary">
              Help centre
            </Link>
            <Link to="/onboarding" className="hover:text-primary">
              Onboarding tour
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AppLayout;
