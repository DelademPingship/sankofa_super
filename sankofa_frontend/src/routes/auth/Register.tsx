import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import ThemeToggle from '../../components/ThemeToggle';
import PrimaryButton from '../../components/PrimaryButton';
import OptimizedImage from '../../components/OptimizedImage';
import { authService } from '../../services/authService';
import { userService } from '../../services/userService';
import { ApiException } from '../../lib/apiException';
import { digitsOnly, formatForDisplay, isValidGhanaMobile, maskForDisplay, normalizeGhanaPhone } from '../../lib/ghanaPhone';
import { useAuth } from '../../contexts/AuthContext';
import MoneyImage from '../../assets/images/money.jpg';

type Stage = 'details' | 'otp';

const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

const extractFieldError = (details: Record<string, unknown> | undefined, key: string): string | undefined => {
  if (!details) {
    return undefined;
  }
  const value = details[key];
  if (typeof value === 'string' && value.trim().length > 0) {
    return value;
  }
  if (Array.isArray(value) && value.length > 0) {
    const first = value[0];
    if (typeof first === 'string') {
      return first;
    }
  }
  return undefined;
};

const Register = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { updateUser } = useAuth();

  const [stage, setStage] = useState<Stage>('details');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const [normalizedPhone, setNormalizedPhone] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errors, setErrors] = useState<{
    fullName?: string;
    phone?: string;
    email?: string;
    otp?: string;
    general?: string;
  }>({});

  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasAppliedPrefill = useRef(false);

  const maskedPhone = useMemo(() => {
    if (!normalizedPhone) {
      return null;
    }
    return maskForDisplay(normalizedPhone);
  }, [normalizedPhone]);

  useEffect(() => {
    const state = location.state as { phone?: string } | null;
    if (state?.phone && !hasAppliedPrefill.current) {
      setPhone(formatForDisplay(state.phone));
      hasAppliedPrefill.current = true;
    }
  }, [location.state]);

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

  const resetOtpStage = () => {
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
    }
    setStage('details');
    setSecondsRemaining(0);
    setOtp('');
    setNormalizedPhone(null);
    setStatusMessage(null);
    setErrors({});
  };

  const handlePhoneChange = (value: string) => {
    setPhone(formatForDisplay(value));
  };

  const submitDetails = async (event: FormEvent) => {
    event.preventDefault();
    const trimmedName = fullName.trim();
    const trimmedEmail = email.trim();

    const nextErrors: typeof errors = {};
    if (trimmedName.length < 2) {
      nextErrors.fullName = 'Enter your full name';
    }
    if (!isValidGhanaMobile(phone)) {
      nextErrors.phone = 'Enter a valid 9-digit MoMo number';
    }
    if (trimmedEmail && !emailRegex.test(trimmedEmail)) {
      nextErrors.email = 'Enter a valid email address';
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    const normalized = normalizeGhanaPhone(phone);
    setLoading(true);
    setErrors({});
    setStatusMessage(null);

    try {
      const result = await authService.registerUser(normalized, trimmedName, trimmedEmail || undefined);
      setStage('otp');
      setNormalizedPhone(result.phoneNumber);
      setOtp('');
      setStatusMessage(result.message ?? `We sent a code to ${maskForDisplay(result.phoneNumber)}`);
      startCountdown();
    } catch (error) {
      if (error instanceof ApiException) {
        const details = error.details as Record<string, unknown> | undefined;
        setErrors({
          fullName: extractFieldError(details, 'full_name'),
          phone: extractFieldError(details, 'phone_number') ?? (!details ? error.message : undefined),
          email: extractFieldError(details, 'email'),
          general: details ? undefined : error.message,
        });
      } else {
        setErrors({ general: 'We could not complete registration. Please try again.' });
      }
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    if (!normalizedPhone) {
      return;
    }
    setLoading(true);
    setErrors((prev) => ({ ...prev, otp: undefined, general: undefined }));

    try {
      await authService.requestOtp(normalizedPhone, 'signup');
      setStatusMessage(`A new code was sent to ${maskForDisplay(normalizedPhone)}`);
      startCountdown();
    } catch (error) {
      if (error instanceof ApiException) {
        setErrors((prev) => ({ ...prev, otp: error.message }));
      } else {
        setErrors((prev) => ({ ...prev, otp: 'We could not resend the code. Please try again.' }));
      }
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (event: FormEvent) => {
    event.preventDefault();
    if (digitsOnly(otp).length !== 6) {
      setErrors((prev) => ({ ...prev, otp: 'Enter the 6-digit code we sent' }));
      return;
    }

    const phoneForVerification = normalizedPhone ?? normalizeGhanaPhone(phone);
    setLoading(true);
    setErrors((prev) => ({ ...prev, otp: undefined, general: undefined }));

    try {
      const authenticated = await authService.verifyOtp(phoneForVerification, digitsOnly(otp), 'signup');
      const refreshed = await userService.refreshCurrentUser();
      const finalUser = refreshed ?? authenticated;
      updateUser(finalUser);
      const requiresKyc = finalUser.kycStatus === 'pending' || finalUser.kycStatus === 'rejected';
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
      }
      setSecondsRemaining(0);
              const targetPath = requiresKyc ? '/auth/kyc' : '/app/home';
        console.log('[Register] Navigating to', targetPath);
        navigate(targetPath, { replace: true });
        // Fallback in case navigate does not trigger a full page load
        window.location.href = targetPath;
    } catch (error) {
      if (error instanceof ApiException) {
        setErrors((prev) => ({ ...prev, otp: error.message }));
      } else {
        setErrors((prev) => ({ ...prev, otp: 'We could not verify the code. Please try again.' }));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100">
      <header className="mx-auto flex max-w-4xl items-center justify-between px-4 py-6">
        <Link to="/" className="text-lg font-semibold text-primary">
          Sankofa Sign-up
        </Link>
        <ThemeToggle />
      </header>
      <main className="mx-auto flex max-w-4xl flex-col gap-10 px-4 pb-16">
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
          <div className="grid gap-0 md:grid-cols-2">
            <div className="space-y-6 p-10">
              <div>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  Step {stage === 'details' ? '1 of 2' : '2 of 2'}
                </span>
                <h1 className="mt-4 text-3xl font-bold text-slate-900 dark:text-white">
                  {stage === 'details' ? 'Join Sankofa Cooperative' : 'Verify your number'}
                </h1>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                  Mirror the mobile onboarding flow with secure, Ghana-first identity verification.
                </p>
              </div>

              {statusMessage && (
                <div className="rounded-2xl border border-primary/30 bg-primary/5 p-4 text-sm text-primary dark:border-primary/40 dark:bg-primary/10">
                  {statusMessage}
                </div>
              )}

              {stage === 'details' ? (
                <form onSubmit={submitDetails} className="space-y-4">
                  {errors.general && (
                    <div className="rounded-2xl bg-red-50 p-4 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
                      {errors.general}
                    </div>
                  )}
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                    Full name
                    <input
                      type="text"
                      value={fullName}
                      onChange={(event) => setFullName(event.target.value)}
                      placeholder="Ama Mensah"
                      disabled={loading}
                      className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-900 shadow-inner focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                    />
                    {errors.fullName && <span className="mt-1 block text-xs text-red-500">{errors.fullName}</span>}
                  </label>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                    Mobile number (Ghana)
                    <div className="mt-2 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-inner focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/30 dark:border-slate-700 dark:bg-slate-900">
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
                    {errors.phone && <span className="mt-1 block text-xs text-red-500">{errors.phone}</span>}
                  </label>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                    Email address (optional)
                    <input
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="ama@sankofa.co"
                      disabled={loading}
                      className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-900 shadow-inner focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                    />
                    {errors.email && <span className="mt-1 block text-xs text-red-500">{errors.email}</span>}
                  </label>
                  <PrimaryButton label={loading ? 'Submitting...' : 'Create account'} type="submit" disabled={loading} />
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    Already have an account?{' '}
                    <Link to="/auth/login" className="font-semibold text-primary hover:underline">
                      Sign in instead
                    </Link>
                  </p>
                </form>
              ) : (
                <form onSubmit={verifyOtp} className="space-y-4">
                  {errors.general && (
                    <div className="rounded-2xl bg-red-50 p-4 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
                      {errors.general}
                    </div>
                  )}
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900">
                    <p className="font-semibold text-slate-900 dark:text-white">We sent a code to</p>
                    <p className="mt-1 font-mono text-base text-primary dark:text-primary-light">{maskedPhone}</p>
                  </div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                    Verification code
                    <input
                      type="text"
                      value={otp}
                      onChange={(event) => setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="123456"
                      disabled={loading}
                      className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-center text-2xl tracking-[0.5em] focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                    />
                    {errors.otp && <span className="mt-1 block text-xs text-red-500">{errors.otp}</span>}
                  </label>
                  <PrimaryButton label={loading ? 'Verifying...' : 'Verify & continue'} type="submit" disabled={loading} />
                  <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 dark:text-slate-300">
                    <button
                      type="button"
                      className="font-semibold text-primary disabled:opacity-50"
                      onClick={resendOtp}
                      disabled={loading || secondsRemaining > 0}
                    >
                      {secondsRemaining > 0 ? `Resend in ${secondsRemaining}s` : 'Resend code'}
                    </button>
                    <button
                      type="button"
                      className="font-semibold text-slate-500 hover:text-primary dark:text-slate-400"
                      onClick={resetOtpStage}
                      disabled={loading}
                    >
                      Use a different number
                    </button>
                  </div>
                </form>
              )}
            </div>
            <div className="relative hidden md:block">
              <OptimizedImage
                src={MoneyImage}
                alt="New member celebrating"
                className="h-full w-full"
                priority={true}
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 rounded-3xl bg-white/90 p-6 text-sm text-slate-600 shadow-xl backdrop-blur dark:bg-slate-900/80 dark:text-slate-300">
                <p className="font-semibold text-slate-900 dark:text-white">Onboarding checklist</p>
                <ul className="mt-3 space-y-2">
                  <li>• Ghana Card-ready identity verification</li>
                  <li>• MoMo-friendly wallets with instant receipts</li>
                  <li>• Guided KYC once you\'re signed in</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-lg dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Need help onboarding?</h2>
          <div className="mt-4 grid gap-4 text-sm text-slate-600 dark:text-slate-300 md:grid-cols-2">
            <div>
              <p className="font-semibold">WhatsApp support</p>
              <p className="mt-1">Message our onboarding squad for manual verification or Ghana Card tips.</p>
            </div>
            <div>
              <p className="font-semibold">Prefer mobile?</p>
              <p className="mt-1">
                Download the{' '}
                <a href="https://sankofa.co/app" className="text-primary hover:underline">
                  Sankofa app
                </a>{' '}
                and resume the same flow.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Register;

