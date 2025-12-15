'use client';

import { useState, useEffect } from 'react';
import { useSession } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Copy,
  Loader2,
  Mail,
  Plus,
  ShieldX,
  Trash2,
  XCircle,
  RefreshCw,
  Sparkles,
  Link as LinkIcon,
  UserPlus,
  Send,
  Key,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface OnboardingToken {
  id: string;
  token: string;
  email: string;
  storeName?: string;
  status: 'pending' | 'used' | 'expired' | 'revoked';
  expiresAt: string;
  usedAt?: string;
  createdBy: string;
  notes?: string;
  createdAt: string;
  onboardingUrl: string;
}

const MASTER_ADMINS = ['sufyanali@gmail.com', 'daniyal@cartaisy.com'];

export default function OnboardingTokensPage() {
  const { data: session } = useSession();
  const [tokens, setTokens] = useState<OnboardingToken[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [email, setEmail] = useState('');
  const [storeName, setStoreName] = useState('');
  const [expiresInHours, setExpiresInHours] = useState('48');
  const [notes, setNotes] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const [createSuccess, setCreateSuccess] = useState('');
  const [createdUrl, setCreatedUrl] = useState('');
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [copiedSuccess, setCopiedSuccess] = useState(false);
  const [sendEmail, setSendEmail] = useState(true);
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  const isMasterAdmin = session?.user?.email && MASTER_ADMINS.includes(session.user.email);

  const pendingCount = tokens.filter(t => t.status === 'pending').length;
  const usedCount = tokens.filter(t => t.status === 'used').length;

  useEffect(() => {
    if (isMasterAdmin) {
      fetchTokens();
    } else {
      setIsLoading(false);
    }
  }, [isMasterAdmin]);

  const fetchTokens = async () => {
    try {
      const res = await fetch('/api/admin/onboarding-tokens');
      const data = await res.json();

      if (data.success) {
        setTokens(data.data);
      } else {
        setError(data.error || 'Failed to fetch tokens');
      }
    } catch (err) {
      setError('Failed to fetch tokens');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError('');
    setCreateSuccess('');

    if (!email) {
      setCreateError('Email is required');
      return;
    }

    setIsCreating(true);

    try {
      const res = await fetch('/api/admin/onboarding-tokens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          storeName: storeName || undefined,
          expiresInHours: parseInt(expiresInHours),
          notes: notes || undefined,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setCreateSuccess('Onboarding link created successfully!');
        setCreatedUrl(data.data.onboardingUrl);

        if (sendEmail) {
          setIsSendingEmail(true);
          try {
            await fetch('/api/admin/send-onboarding-email', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                email,
                storeName: storeName || undefined,
                onboardingUrl: data.data.onboardingUrl,
                expiresInHours: parseInt(expiresInHours),
              }),
            });
            setCreateSuccess('Onboarding link created and email sent!');
          } catch {
            setCreateSuccess('Link created but email failed to send.');
          } finally {
            setIsSendingEmail(false);
          }
        }

        setEmail('');
        setStoreName('');
        setNotes('');
        fetchTokens();
      } else {
        setCreateError(data.error || 'Failed to create token');
      }
    } catch (err) {
      setCreateError('Failed to create token');
    } finally {
      setIsCreating(false);
    }
  };

  const handleRevoke = async (tokenId: string) => {
    if (!confirm('Are you sure you want to revoke this token?')) return;

    try {
      const res = await fetch(`/api/admin/onboarding-tokens?id=${tokenId}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (data.success) {
        fetchTokens();
      } else {
        alert(data.error || 'Failed to revoke token');
      }
    } catch (err) {
      alert('Failed to revoke token');
    }
  };

  const copyToClipboard = (url: string, tokenId: string) => {
    navigator.clipboard.writeText(url);
    setCopiedToken(tokenId);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-amber-100 text-amber-700">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            Pending
          </span>
        );
      case 'used':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-emerald-100 text-emerald-700">
            <CheckCircle2 className="w-3 h-3" />
            Used
          </span>
        );
      case 'expired':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-slate-100 text-slate-600">
            <Clock className="w-3 h-3" />
            Expired
          </span>
        );
      case 'revoked':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700">
            <XCircle className="w-3 h-3" />
            Revoked
          </span>
        );
      default:
        return null;
    }
  };

  // Access denied
  if (!isMasterAdmin) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="rounded-xl border-2 border-dashed border-red-200 bg-red-50/50 p-12 max-w-md text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-100 flex items-center justify-center mx-auto mb-4">
            <ShieldX className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-red-900 mb-2">Access Denied</h2>
          <p className="text-red-700">
            You don't have permission to access this page.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-rose-600 mx-auto mb-3" />
          <p className="text-slate-600">Loading onboarding tokens...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-8">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
        <div className="absolute inset-0 bg-grid-white/[0.02]" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-rose-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl" />

        <div className="relative">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 text-rose-400 text-sm font-medium mb-2">
                <Key className="w-4 h-4" />
                <span>Admin Panel</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                Onboarding Tokens
              </h1>
              <p className="text-slate-400 text-lg max-w-xl">
                Generate and manage onboarding links for new store owners.
              </p>
            </div>

            {/* Quick Stats */}
            <div className="flex gap-6">
              <div className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-2">
                  <LinkIcon className="w-7 h-7 text-rose-400" />
                </div>
                <p className="text-2xl font-bold text-white">{tokens.length}</p>
                <p className="text-sm text-slate-400">Total Tokens</p>
              </div>
              <div className="w-px bg-white/10" />
              <div className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-2">
                  <Clock className="w-7 h-7 text-amber-400" />
                </div>
                <p className="text-2xl font-bold text-white">{pendingCount}</p>
                <p className="text-sm text-slate-400">Pending</p>
              </div>
              <div className="w-px bg-white/10" />
              <div className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-2">
                  <CheckCircle2 className="w-7 h-7 text-emerald-400" />
                </div>
                <p className="text-2xl font-bold text-white">{usedCount}</p>
                <p className="text-sm text-slate-400">Used</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create Token Form */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-slate-600" />
            <h2 className="text-lg font-semibold text-slate-900">Generate New Onboarding Link</h2>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Create a secure signup link for a new store owner
          </p>
        </div>
        <div className="p-6">
          <form onSubmit={handleCreate} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="email">Store Owner Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="owner@store.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isCreating}
                  required
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="storeName">Store Name (Optional)</Label>
                <Input
                  id="storeName"
                  type="text"
                  placeholder="e.g., Nike Official Store"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  disabled={isCreating}
                  className="h-11"
                />
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="expires">Link Expires In</Label>
                <Select value={expiresInHours} onValueChange={setExpiresInHours}>
                  <SelectTrigger className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="24">24 hours</SelectItem>
                    <SelectItem value="48">48 hours</SelectItem>
                    <SelectItem value="72">72 hours</SelectItem>
                    <SelectItem value="168">7 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Internal Notes (Optional)</Label>
                <Input
                  id="notes"
                  type="text"
                  placeholder="e.g., Referred by John"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  disabled={isCreating}
                  className="h-11"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
              <input
                type="checkbox"
                id="sendEmail"
                checked={sendEmail}
                onChange={(e) => setSendEmail(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-rose-600 focus:ring-rose-500"
              />
              <Label htmlFor="sendEmail" className="text-sm font-normal cursor-pointer flex items-center gap-2">
                <Send className="w-4 h-4 text-slate-500" />
                Send onboarding email to store owner
              </Label>
            </div>

            {createError && (
              <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <p className="text-sm text-red-700">{createError}</p>
              </div>
            )}

            {createSuccess && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <p className="text-sm text-emerald-700 font-medium">{createSuccess}</p>
                  {isSendingEmail && <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />}
                </div>
                {createdUrl && (
                  <div className="flex items-center gap-2 p-3 bg-white rounded-lg border border-emerald-200">
                    <code className="flex-1 text-xs text-slate-700 break-all font-mono">{createdUrl}</code>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(createdUrl);
                        setCopiedSuccess(true);
                        setTimeout(() => setCopiedSuccess(false), 2000);
                      }}
                      className="shrink-0 gap-1.5"
                    >
                      {copiedSuccess ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          Copy
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            )}

            <Button type="submit" disabled={isCreating || isSendingEmail} className="gap-2 bg-slate-900 hover:bg-slate-800">
              {isCreating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              Generate Onboarding Link
            </Button>
          </form>
        </div>
      </div>

      {/* Tokens List */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Key className="w-5 h-5 text-slate-600" />
          <h2 className="text-lg font-semibold text-slate-900">All Onboarding Tokens</h2>
          <span className="text-sm text-slate-500">({tokens.length})</span>
        </div>

        {error && (
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl mb-4">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {tokens.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <LinkIcon className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No tokens created yet</h3>
            <p className="text-slate-500">
              Create your first onboarding token to invite store owners.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {tokens.map((token) => (
              <div
                key={token.id}
                className={`p-5 rounded-xl border transition-all ${
                  token.status === 'pending'
                    ? 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-md'
                    : token.status === 'used'
                      ? 'bg-emerald-50/50 border-emerald-200'
                      : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      token.status === 'pending'
                        ? 'bg-amber-100'
                        : token.status === 'used'
                          ? 'bg-emerald-100'
                          : 'bg-slate-100'
                    }`}>
                      <Mail className={`w-6 h-6 ${
                        token.status === 'pending'
                          ? 'text-amber-600'
                          : token.status === 'used'
                            ? 'text-emerald-600'
                            : 'text-slate-500'
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-semibold text-slate-900">{token.email}</span>
                        {getStatusBadge(token.status)}
                      </div>
                      {token.storeName && (
                        <p className="text-sm text-slate-600 mb-1">Store: {token.storeName}</p>
                      )}
                      <p className="text-xs text-slate-500">
                        Created {formatDate(new Date(token.createdAt))} by {token.createdBy}
                      </p>
                      {token.status === 'pending' && (
                        <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Expires {formatDate(new Date(token.expiresAt))}
                        </p>
                      )}
                      {token.usedAt && (
                        <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Used on {formatDate(new Date(token.usedAt))}
                        </p>
                      )}
                      {token.notes && (
                        <p className="text-xs text-slate-400 mt-1">Note: {token.notes}</p>
                      )}
                    </div>
                  </div>

                  {token.status === 'pending' && (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(token.onboardingUrl, token.id)}
                        className="gap-1.5"
                      >
                        {copiedToken === token.id ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            Copy Link
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRevoke(token.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-200"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pro Tips */}
      <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-rose-50 to-orange-50 p-6">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <div className="w-12 h-12 rounded-xl bg-rose-100 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-6 h-6 text-rose-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-slate-900 mb-1">Onboarding Tips</h3>
            <ul className="text-sm text-slate-600 space-y-1">
              <li>• Each token can only be used once and expires automatically</li>
              <li>• Store owners will set their own password during signup</li>
              <li>• You can revoke pending tokens if they're no longer needed</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
