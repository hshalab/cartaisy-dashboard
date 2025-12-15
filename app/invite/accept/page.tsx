'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

function AcceptInviteForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams?.get('token');

  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('No invitation token provided. Please check your invitation link.');
    }
  }, [token]);

  const passwordStrength = {
    hasMinLength: password.length >= 6,
    hasUpperCase: /[A-Z]/.test(password),
    hasLowerCase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
  };

  const isPasswordStrong = Object.values(passwordStrength).filter(Boolean).length >= 3;
  const passwordsMatch = password === confirmPassword && password.length > 0;
  const isFormValid = name.length >= 2 && isPasswordStrong && passwordsMatch;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('Invalid invitation token');
      return;
    }

    if (!isFormValid) {
      setError('Please fill in all fields correctly');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/team/invite/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, name, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to accept invitation');
        return;
      }

      setSuccess(true);
      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-0 shadow-lg">
        <CardHeader className="space-y-1">
          <div className="space-y-2">
            <CardTitle className="text-3xl font-bold">Accept Invitation</CardTitle>
            <CardDescription>
              Set up your account to join the team
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {success ? (
            <div className="space-y-4">
              <div className="flex items-center justify-center p-4 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle2 className="w-6 h-6 text-green-600 mr-3" />
                <div>
                  <p className="font-medium text-green-900">Account Created!</p>
                  <p className="text-sm text-green-700">Redirecting to login...</p>
                </div>
              </div>
              <p className="text-sm text-slate-600 text-center">
                Your account has been created successfully. You can now log in with your credentials.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {!token ? (
                <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              ) : null}

              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  Full Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isLoading || !token}
                  className="h-10"
                  required
                />
                {name && name.length < 2 && (
                  <p className="text-xs text-red-600">Name must be at least 2 characters</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create a strong password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading || !token}
                    className="h-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {password && (
                  <div className="space-y-2 mt-3 p-3 bg-slate-50 rounded-lg">
                    <div className="text-xs font-semibold text-slate-600">Password strength:</div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {passwordStrength.hasMinLength ? (
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                        ) : (
                          <div className="w-4 h-4 bg-slate-300 rounded-full"></div>
                        )}
                        <span className="text-xs text-slate-600">At least 6 characters</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {passwordStrength.hasUpperCase ? (
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                        ) : (
                          <div className="w-4 h-4 bg-slate-300 rounded-full"></div>
                        )}
                        <span className="text-xs text-slate-600">Uppercase letter</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {passwordStrength.hasLowerCase ? (
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                        ) : (
                          <div className="w-4 h-4 bg-slate-300 rounded-full"></div>
                        )}
                        <span className="text-xs text-slate-600">Lowercase letter</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {passwordStrength.hasNumber ? (
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                        ) : (
                          <div className="w-4 h-4 bg-slate-300 rounded-full"></div>
                        )}
                        <span className="text-xs text-slate-600">Number</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium">
                  Confirm Password
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isLoading || !token}
                    className="h-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                    disabled={isLoading}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {confirmPassword && (
                  <div className="flex items-center gap-2 mt-2">
                    {passwordsMatch ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        <span className="text-xs text-green-600 font-medium">Passwords match</span>
                      </>
                    ) : (
                      <>
                        <div className="w-4 h-4 bg-red-300 rounded-full"></div>
                        <span className="text-xs text-red-600 font-medium">Passwords don't match</span>
                      </>
                    )}
                  </div>
                )}
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-10 bg-blue-600 hover:bg-blue-700"
                disabled={isLoading || !isFormValid || !token}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Creating account...
                  </>
                ) : (
                  'Create Account & Join'
                )}
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-slate-500">Already have an account?</span>
                </div>
              </div>

              <p className="text-center text-sm text-slate-600">
                <Link href="/login" className="font-semibold text-blue-600 hover:underline">
                  Sign in instead
                </Link>
              </p>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function AcceptInvitePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center p-4">
          <Card className="w-full max-w-md border-0 shadow-lg">
            <CardContent className="py-16">
              <div className="flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                <p className="text-slate-600">Loading...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      }
    >
      <AcceptInviteForm />
    </Suspense>
  );
}
