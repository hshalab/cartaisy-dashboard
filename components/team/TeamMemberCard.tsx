'use client';

import { useState } from 'react';
import { TeamMember } from '@/types';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MoreVertical, Trash2, UserCog, AlertCircle, Loader2 } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface TeamMemberCardProps {
  member: TeamMember;
  currentUserId: string;
  canManage: boolean;
  onMemberRemoved: () => void;
  onRoleUpdated: () => void;
}

export function TeamMemberCard({
  member,
  currentUserId,
  canManage,
  onMemberRemoved,
  onRoleUpdated,
}: TeamMemberCardProps) {
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [newRole, setNewRole] = useState(member.role);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState('');

  const isCurrentUser = member.id === currentUserId;
  const initials = (member.name || member.email)
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'US';

  const handleRoleUpdate = async () => {
    if (newRole === member.role) {
      setShowRoleDialog(false);
      return;
    }

    setError('');
    setIsUpdating(true);

    try {
      const response = await fetch(`/api/team/${member.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Failed to update role');
        return;
      }

      setShowRoleDialog(false);
      onRoleUpdated();
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemove = async () => {
    setError('');
    setIsUpdating(true);

    try {
      const response = await fetch(`/api/team/${member.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Failed to remove member');
        return;
      }

      setShowRemoveDialog(false);
      onMemberRemoved();
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-lg hover:border-slate-300 transition-colors">
        <div className="flex items-center gap-3 flex-1">
          <Avatar className="w-10 h-10">
            <AvatarFallback className="bg-slate-900 text-white font-semibold text-sm">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-slate-900 text-sm truncate">
                {member.name || member.email}
              </h3>
              {isCurrentUser && (
                <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                  You
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 truncate">{member.email}</p>
            <div className="flex items-center gap-1.5 mt-1.5">
              <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                member.role === 'super_admin'
                  ? 'bg-slate-100 text-slate-700'
                  : 'bg-slate-100 text-slate-600'
              }`}>
                {member.role === 'super_admin' ? 'Super Admin' : 'Admin'}
              </span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                member.isActive
                  ? 'bg-green-50 text-green-600'
                  : 'bg-amber-50 text-amber-600'
              }`}>
                {member.isActive ? 'Active' : 'Pending'}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              {member.isActive ? 'Joined' : 'Invited'} {formatDate(new Date(member.createdAt))}
            </p>
          </div>
        </div>

        {canManage && !isCurrentUser && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setShowRoleDialog(true)}
                className="flex items-center gap-2"
              >
                <UserCog className="w-4 h-4" />
                <span>Change Role</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setShowRemoveDialog(true)}
                className="flex items-center gap-2 text-red-600"
              >
                <Trash2 className="w-4 h-4" />
                <span>Remove</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Change Role Dialog */}
      <Dialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
        <DialogContent>
          <DialogTitle>Change Member Role</DialogTitle>
          <DialogDescription>
            Update the role for {member.name || member.email}
          </DialogDescription>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">New Role</label>
              <Select value={newRole} onValueChange={(value) => setNewRole(value as 'super_admin' | 'admin')} disabled={isUpdating}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin - Can manage components</SelectItem>
                  <SelectItem value="super_admin">Super Admin - Full access</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {error && (
              <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setShowRoleDialog(false);
                  setNewRole(member.role);
                  setError('');
                }}
                disabled={isUpdating}
              >
                Cancel
              </Button>
              <Button
                onClick={handleRoleUpdate}
                disabled={isUpdating || newRole === member.role}
                className="bg-slate-900 hover:bg-slate-800"
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Updating...
                  </>
                ) : (
                  'Update Role'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Remove Member Dialog */}
      <Dialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <DialogContent>
          <DialogTitle>Remove Member?</DialogTitle>
          <DialogDescription>
            Are you sure you want to remove {member.name || member.email} from your team? This action cannot be undone.
          </DialogDescription>

          {error && (
            <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setShowRemoveDialog(false);
                setError('');
              }}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRemove}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Removing...
                </>
              ) : (
                'Remove Member'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
