'use client';

import { useEffect, useState } from 'react';
import { useSession } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { TeamMember, Invitation } from '@/types';
import { InviteMemberDialog } from '@/components/team/InviteMemberDialog';
import { TeamMemberCard } from '@/components/team/TeamMemberCard';
import { Button } from '@/components/ui/button';
import {
  AlertCircle,
  Users,
  UserPlus,
  RefreshCw,
  Sparkles,
  Mail,
  Clock,
  Shield,
  ShieldCheck,
  Crown,
} from 'lucide-react';
import { canManageTeam } from '@/lib/utils/permissions';

export default function TeamPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [pendingInvitations, setPendingInvitations] = useState<Invitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showInviteDialog, setShowInviteDialog] = useState(false);

  // Check authorization
  useEffect(() => {
    if (session && !canManageTeam(session.user?.role)) {
      router.push('/dashboard');
    }
  }, [session, router]);

  // Fetch team members
  useEffect(() => {
    if (!session?.user?.id) return;

    const fetchTeam = async () => {
      try {
        setIsLoading(true);
        setError('');
        const response = await fetch('/api/team');

        if (!response.ok) {
          if (response.status === 403) {
            router.push('/dashboard');
            return;
          }
          throw new Error('Failed to fetch team');
        }

        const data = await response.json();
        setMembers(data.data.members || []);
        setPendingInvitations(data.data.pendingInvitations || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load team');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeam();
  }, [session?.user?.id, router]);

  const handleRefetch = async () => {
    try {
      const response = await fetch('/api/team');
      if (response.ok) {
        const data = await response.json();
        setMembers(data.data.members || []);
        setPendingInvitations(data.data.pendingInvitations || []);
      }
    } catch (err) {
      console.error('Failed to refetch team:', err);
    }
  };

  if (!canManageTeam(session?.user?.role)) {
    return null;
  }

  const superAdminCount = members.filter(m => m.role === 'super_admin').length;
  const adminCount = members.filter(m => m.role === 'admin').length;

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-6 h-6 animate-spin text-violet-600 mx-auto mb-2" />
          <p className="text-xs text-slate-500">Loading team...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-8">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
        <div className="absolute inset-0 bg-grid-white/[0.02]" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl" />

        <div className="relative">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 text-violet-400 text-xs font-medium mb-2">
                <Users className="w-4 h-4" />
                <span>Team Management</span>
              </div>
              <h1 className="text-2xl font-semibold tracking-tight text-white mb-2">
                Your Team
              </h1>
              <p className="text-slate-400 text-sm max-w-xl">
                Manage team members, roles, and permissions for your store.
              </p>
            </div>

            {/* Quick Stats */}
            <div className="flex gap-6">
              <div className="text-center">
                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center mx-auto mb-2">
                  <Users className="w-5 h-5 text-violet-400" />
                </div>
                <p className="text-xl font-semibold text-white">{members.length}</p>
                <p className="text-xs font-medium text-slate-400">Members</p>
              </div>
              <div className="w-px bg-white/10" />
              <div className="text-center">
                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center mx-auto mb-2">
                  <Crown className="w-5 h-5 text-amber-400" />
                </div>
                <p className="text-xl font-semibold text-white">{superAdminCount}</p>
                <p className="text-xs font-medium text-slate-400">Super Admins</p>
              </div>
              <div className="w-px bg-white/10" />
              <div className="text-center">
                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center mx-auto mb-2">
                  <Mail className="w-5 h-5 text-pink-400" />
                </div>
                <p className="text-xl font-semibold text-white">{pendingInvitations.length}</p>
                <p className="text-xs font-medium text-slate-400">Pending</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-3 rounded-xl bg-white border border-slate-200">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-violet-100 text-violet-700">
            <Shield className="w-3.5 h-3.5" />
            <span className="text-xs font-medium">{adminCount} Admins</span>
          </div>
          <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-amber-100 text-amber-700">
            <Crown className="w-3.5 h-3.5" />
            <span className="text-xs font-medium">{superAdminCount} Super Admins</span>
          </div>
        </div>

        <Button
          onClick={() => setShowInviteDialog(true)}
          className="bg-slate-900 hover:bg-slate-800 gap-2 text-xs h-8"
        >
          <UserPlus className="w-3.5 h-3.5" />
          Invite Member
        </Button>
      </div>

      {/* Error State */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <div>
            <p className="font-medium text-red-900">Error</p>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Team Members Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <ShieldCheck className="w-5 h-5 text-slate-600" />
          <h2 className="text-sm font-semibold tracking-tight text-slate-900">Active Members</h2>
          <span className="text-xs text-slate-500">({members.length})</span>
        </div>

        {members.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-12">
            <div className="flex flex-col items-center text-center max-w-md mx-auto">
              <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-slate-400" />
              </div>
              <h3 className="text-base font-semibold text-slate-900 mb-2">No team members yet</h3>
              <p className="text-xs text-slate-500 mb-6">
                Invite your first team member to start collaborating on your store.
              </p>
              <Button
                onClick={() => setShowInviteDialog(true)}
                className="bg-slate-900 hover:bg-slate-800 gap-2 text-xs h-8"
              >
                <UserPlus className="w-3.5 h-3.5" />
                Invite First Member
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {members.map((member) => (
              <TeamMemberCard
                key={member.id}
                member={member}
                currentUserId={session?.user?.id || ''}
                canManage={true}
                onMemberRemoved={handleRefetch}
                onRoleUpdated={handleRefetch}
              />
            ))}
          </div>
        )}
      </div>

      {/* Pending Invitations Section */}
      {pendingInvitations.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-amber-600" />
            <h2 className="text-sm font-semibold tracking-tight text-slate-900">Pending Invitations</h2>
            <span className="text-xs text-slate-500">({pendingInvitations.length})</span>
          </div>

          <div className="space-y-3">
            {pendingInvitations.map((invitation) => (
              <div
                key={invitation.id}
                className="flex items-center justify-between p-4 bg-amber-50 border border-amber-200 rounded-xl"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                    <Mail className="w-6 h-6 text-amber-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-900">{invitation.email}</h3>
                    <p className="text-sm text-slate-600">
                      Invited by {invitation.invitedBy.email}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className={`inline-flex items-center gap-1 text-xs font-medium ${
                        invitation.role === 'super_admin'
                          ? 'text-amber-700'
                          : 'text-violet-700'
                      }`}>
                        {invitation.role === 'super_admin' ? (
                          <Crown className="w-3 h-3" />
                        ) : (
                          <Shield className="w-3 h-3" />
                        )}
                        {invitation.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                      </span>
                      <span className="text-xs text-slate-500">
                        Expires {new Date(invitation.inviteExpiresAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-100 text-amber-700 text-sm font-medium">
                  <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  Pending
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pro Tips */}
      <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-violet-50 to-pink-50 p-5">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5 text-violet-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-slate-900 mb-1">Role Permissions</h3>
            <ul className="text-xs text-slate-500 space-y-1">
              <li>• <strong>Super Admin:</strong> Full access including team management and billing</li>
              <li>• <strong>Admin:</strong> Can manage app content but cannot invite or remove members</li>
            </ul>
          </div>
        </div>
      </div>

      <InviteMemberDialog
        open={showInviteDialog}
        onOpenChange={setShowInviteDialog}
        onSuccess={handleRefetch}
      />
    </div>
  );
}
