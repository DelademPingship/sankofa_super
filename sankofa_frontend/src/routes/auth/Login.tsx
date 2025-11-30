import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ThemeToggle from '../../components/ThemeToggle';
import PrimaryButton from '../../components/PrimaryButton';
import OptimizedImage from '../../components/OptimizedImage';
import { authService } from '../../services/authService';
import { userService } from '../../services/userService';
import { useAuth } from '../../contexts/AuthContext';
import { ApiException } from '../../lib/apiException';
import { digitsOnly, formatForDisplay, isValidGhanaMobile, maskForDisplay, normalizeGhanaPhone } from '../../lib/ghanaPhone';
import ContribImage from '../../assets/images/Contrib.png';

const Login = () => {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [stage, setStage] = useState<'phone' | 'otp'>('phone');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [normalizedPhone, setNormalizedPhone] = useState<string | null>(null);
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [showSignupPrompt, setShowSignupPrompt] = useState(false);
  const navigate = useNavigate();
  const { login, updateUser } = useAuth();
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const maskedPhone = useMemo(() => (normalizedPhone ? maskForDisplay(normalizedPhone) : null), [normalizedPhone]);

  useEffect(() => {
    return () => {
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
      }
    };
  }, []);

  const startCountdown = () => {
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
    }
    setSecondsRemaining(60);
    countdownRef.current = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          if (countdownRef.current) {
            clearInterval(countdownRef.current);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const resetToPhoneStage = () => {
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
    }
    setStage('phone');
    setSecondsRemaining(0);
    setOtp('');
    setNormalizedPhone(null);
    setStatusMessage(null);
    setShowSignupPrompt(false);
    setError(null);
  };

  const handlePhoneChange = (value: string) => {
    setPhone(formatForDisplay(value));
  };

  const goToSignup = () => {
    const digits = digitsOnly(phone);
    const localDigits = digits.length >= 9 ? digits.slice(-9) : digits;
    navigate('/auth/register', {
      state: localDigits ? { phone: localDigits } : undefined,
    });
  };

  const submitPhone = async (event: FormEvent) => {
    event.preventDefault();
    if (!isValidGhanaMobile(phone)) {
      setError('Enter a valid 9-digit MoMo number');
      setShowSignupPrompt(false);
      return;
    }

    const normalized = normalizeGhanaPhone(phone);
    setLoading(true);
    setError(null);
    setShowSignupPrompt(false);
    setStatusMessage(null);

    try {
      await authService.requestOtp(normalized, 'login');
      setStage('otp');
      setNormalizedPhone(normalized);
      setOtp('');
      setStatusMessage(`We sent a code to ${maskForDisplay(normalized)}`);
      startCountdown();
    } catch (err) {
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
      }
      setSecondsRemaining(0);
      setNormalizedPhone(null);

      if (err instanceof ApiException) {
        let detailMessage = err.message;
        const detailField = err.details?.detail ?? err.details?.message;
        if (typeof detailField === 'string' && detailField.trim().length > 0) {
          detailMessage = detailField;
        }
        const userMissing = detailMessage.toLowerCase().includes('no account is registered');
        setError(detailMessage);
        setShowSignupPrompt(userMissing);
      } else {
        setError('Failed to send OTP. Please try again.');
        setShowSignupPrompt(false);
      }
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    const phoneToUse = normalizedPhone ?? (isValidGhanaMobile(phone) ? normalizeGhanaPhone(phone) : null);
    if (!phoneToUse || loading) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await authService.requestOtp(phoneToUse, 'login');
      setStatusMessage(`A new code was sent to ${maskForDisplay(phoneToUse)}`);
      startCountdown();
    } catch (err) {
      if (err instanceof ApiException) {
        setError(err.message);
      } else {
        setError('Failed to resend the code. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const submitOtp = async (event: FormEvent) => {
    event.preventDefault();
    const code = digitsOnly(otp);
    if (code.length !== 6) {
      setError('Enter the 6-digit code we sent');
      return;
    }

    const phoneForVerification = normalizedPhone ?? normalizeGhanaPhone(phone);

    setLoading(true);
    setError(null);

    try {
      await login(phoneForVerification, code);
      const refreshed = await userService.refreshCurrentUser();
      if (refreshed) {
        updateUser(refreshed);
      }
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
      }
      setSecondsRemaining(0);
      const latestUser = refreshed ?? (await authService.getStoredUser());
      const requiresKyc = latestUser ? latestUser.kycStatus === 'pending' || latestUser.kycStatus === 'rejected' : false;
      navigate(requiresKyc ? '/auth/kyc' : '/app/home');
    } catch (err) {
      if (err instanceof ApiException) {
        setError(err.message);
      } else {
        setError('Failed to verify OTP. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100">
      <header className="mx-auto flex max-w-4xl items-center justify-between px-4 py-6">
        <Link to="/" className="text-lg font-semibold text-primary">
          Sankofa Sign-in
        </Link>
        <ThemeToggle />
      </header>
      <main className="mx-auto flex max-w-4xl flex-col gap-10 px-4 pb-16">
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
          <div className="grid gap-0 md:grid-cols-2">
            <div className="space-y-6 p-10">
              <div>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">Secure access</span>
                <h1 className="mt-4 text-3xl font-bold text-slate-900 dark:text-white">{stage === 'phone' ? 'Enter your Ghana number' : 'Enter the 6-digit OTP'}</h1>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                  We keep your account safe with OTP verification and biometric-ready settings.
                </p>
              </div>

              {stage === 'phone' ? (
                <form onSubmit={submitPhone} className="space-y-4">
                  {error && (
                    <div className="rounded-2xl bg-red-50 p-4 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
                      {error}
                    </div>
                  )}
                  {showSignupPrompt && (
                    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-500/40 dark:bg-amber-900/30 dark:text-amber-200">
                      <p className="font-semibold">No account is registered with this number.</p>
                      <button type="button" className="mt-2 text-sm font-semibold text-primary hover:underline" onClick={goToSignup}>
                        Create a Sankofa account instead
                      </button>
                    </div>
                  )}
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                    Mobile number
                    <div className="mt-2 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-base text-slate-900 shadow-inner focus-within:border-primary focus-within:outline-none focus-within:ring-2 focus-within:ring-primary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
                      <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">+233</span>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(event) => handlePhoneChange(event.target.value)}
                        placeholder="24 123 4567"
                        disabled={loading}
                        className="flex-1 border-none bg-transparent text-base text-slate-900 outline-none placeholder:text-slate-400 dark:text-slate-100"
                      />
                    </div>
                  </label>
                  <PrimaryButton label={loading ? 'Sending...' : 'Send OTP'} type="submit" disabled={loading} />
                </form>
              ) : (
                <form onSubmit={submitOtp} className="space-y-4">
                  {error && (
                    <div className="rounded-2xl bg-red-50 p-4 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
                      {error}
                    </div>
                  )}
                  {statusMessage && (
                    <div className="rounded-2xl border border-primary/30 bg-primary/5 p-4 text-sm text-primary dark:border-primary/40 dark:bg-primary/10">
                      {statusMessage}
                    </div>
                  )}
                  {maskedPhone && (
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900">
                      <p className="font-semibold text-slate-900 dark:text-white">Code sent to</p>
                      <p className="mt-1 font-mono text-base text-primary dark:text-primary-light">{maskedPhone}</p>
                    </div>
                  )}
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                    Verification code
                    <input
                      type="text"
                      value={otp}
                      onChange={(event) => setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="123456"
                      disabled={loading}
                      className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-center text-2xl tracking-[0.5em] focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                    />
                  </label>
                  <PrimaryButton label={loading ? 'Verifying...' : 'Verify & continue'} type="submit" disabled={loading} />
                  <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
                    <button
                      type="button"
                      className="font-semibold text-primary hover:underline disabled:opacity-50"
                      onClick={resendOtp}
                      disabled={loading || secondsRemaining > 0}
                    >
                      {secondsRemaining > 0 ? `Resend OTP in ${secondsRemaining}s` : 'Resend OTP'}
                    </button>
                    <button
                      type="button"
                      className="font-semibold text-slate-500 hover:text-primary disabled:opacity-50 dark:text-slate-300"
                      onClick={resetToPhoneStage}
                      disabled={loading}
                    >
                      Back to phone number
                    </button>
                  </div>
                </form>
              )}
            </div>
            <div className="relative hidden md:block">
              <OptimizedImage
                src={ContribImage}
                alt="Member smiling"
                className="h-full w-full"
                priority={true}
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 rounded-3xl bg-white/90 p-6 text-sm text-slate-600 shadow-xl backdrop-blur dark:bg-slate-900/80 dark:text-slate-300">
                <p className="font-semibold text-slate-900 dark:text-white">Security snapshot</p>
                <ul className="mt-3 space-y-2">
                  <li>• Device binding & biometric-ready settings</li>
                  <li>• OTP delivered in under 10 seconds</li>
                  <li>• Real-time fraud monitoring</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-lg dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Need help signing in?</h2>
          <div className="mt-4 grid gap-4 text-sm text-slate-600 dark:text-slate-300 md:grid-cols-2">
            <div>
              <p className="font-semibold">No OTP received</p>
              <p className="mt-1">Resend the OTP or contact our support team via WhatsApp for manual verification.</p>
            </div>
            <div>
              <p className="font-semibold">New to Sankofa?</p>
              <p className="mt-1">
                Create an account via the <Link to="/auth/register" className="text-primary hover:underline">web onboarding</Link> or take the{' '}
                <Link to="/onboarding" className="text-primary hover:underline">guided tour</Link> to explore the full experience.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Login;
