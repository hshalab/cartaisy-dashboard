import { connectToDatabase } from '@/lib/db';
import { User } from '@/models/User';
import { Store } from '@/models/Store';
import crypto from 'crypto';

export interface TeamMember {
  id: string;
  email: string;
  name: string | null;
  role: 'super_admin' | 'admin';
  isActive: boolean;
  invitedBy: string | null;
  createdAt: string;
  lastLoginAt: string | null;
}

export interface Invitation {
  id: string;
  email: string;
  role: 'super_admin' | 'admin';
  inviteToken: string;
  inviteExpiresAt: string;
  invitedBy: {
    id: string;
    email: string;
  };
}

/**
 * Get all team members for a store
 */
export async function getTeamMembers(storeId: string): Promise<TeamMember[]> {
  await connectToDatabase();

  const users = await User.find(
    { storeId, isActive: true },
    'email name role isActive createdAt lastLoginAt invitedBy'
  ).sort({ createdAt: -1 });

  return users.map((user) => ({
    id: user._id.toString(),
    email: user.email,
    name: user.name || null,
    role: user.role,
    isActive: user.isActive,
    invitedBy: user.invitedBy ? user.invitedBy.toString() : null,
    createdAt: user.createdAt.toISOString(),
    lastLoginAt: user.lastLoginAt ? user.lastLoginAt.toISOString() : null,
  }));
}

/**
 * Get pending invitations for a store
 */
export async function getPendingInvitations(storeId: string): Promise<Invitation[]> {
  await connectToDatabase();

  const now = new Date();
  const users = await User.find(
    { storeId, isActive: false, inviteToken: { $ne: null }, inviteExpiresAt: { $gt: now } },
    'email role inviteToken inviteExpiresAt invitedBy'
  ).populate('invitedBy', 'email');

  return users.map((user) => ({
    id: user._id.toString(),
    email: user.email,
    role: user.role,
    inviteToken: user.inviteToken || '',
    inviteExpiresAt: user.inviteExpiresAt?.toISOString() || '',
    invitedBy: {
      id: (user.invitedBy as any)?._id?.toString() || '',
      email: (user.invitedBy as any)?.email || '',
    },
  }));
}

/**
 * Send invitation to a new member
 */
export async function inviteMember(
  storeId: string,
  invitingUserId: string,
  email: string,
  role: 'super_admin' | 'admin'
): Promise<Invitation> {
  await connectToDatabase();

  // Check if email already exists anywhere (email is globally unique)
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    if (existingUser.storeId.toString() === storeId) {
      throw new Error('User is already a member of this store');
    } else {
      throw new Error('This email is already registered with another store');
    }
  }

  // Generate invite token
  const inviteToken = crypto.randomBytes(32).toString('hex');
  const inviteExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  // Get the store name for the invited user
  const store = await Store.findById(storeId);
  if (!store) {
    throw new Error('Store not found');
  }

  // Create pending user
  const user = new User({
    email,
    password: crypto.randomBytes(16).toString('hex'), // Random password for pending user
    storeId,
    storeName: store.name,
    role,
    inviteToken,
    inviteExpiresAt,
    invitedBy: invitingUserId,
    isActive: false, // Mark as inactive until invitation accepted
  });

  await user.save();

  const invitingUser = await User.findById(invitingUserId, 'email');

  return {
    id: user._id.toString(),
    email: user.email,
    role: user.role,
    inviteToken,
    inviteExpiresAt: inviteExpiresAt.toISOString(),
    invitedBy: {
      id: invitingUserId,
      email: invitingUser?.email || '',
    },
  };
}

/**
 * Accept invitation and set up user account
 */
export async function acceptInvitation(
  token: string,
  name: string,
  password: string
): Promise<string> {
  await connectToDatabase();

  // Find pending user with valid token
  const now = new Date();
  const user = await User.findOne({
    inviteToken: token,
    inviteExpiresAt: { $gt: now },
    isActive: false,
  });

  if (!user) {
    throw new Error('Invalid or expired invitation');
  }

  // Update user with account details
  user.name = name;
  user.password = password;
  user.isActive = true;
  user.inviteToken = undefined;
  user.inviteExpiresAt = undefined;

  await user.save();

  return user._id.toString();
}

/**
 * Remove member from store
 */
export async function removeMember(storeId: string, memberId: string, requestingUserId: string): Promise<void> {
  await connectToDatabase();

  // Prevent removing self
  if (memberId === requestingUserId) {
    throw new Error('Cannot remove yourself from the team');
  }

  const member = await User.findById(memberId);
  if (!member || member.storeId.toString() !== storeId) {
    throw new Error('Member not found');
  }

  // Prevent removing last super_admin
  if (member.role === 'super_admin') {
    const superAdminCount = await User.countDocuments({
      storeId,
      role: 'super_admin',
      _id: { $ne: memberId },
    });
    if (superAdminCount === 0) {
      throw new Error('Cannot remove the last super_admin from the store');
    }
  }

  await User.findByIdAndDelete(memberId);
}

/**
 * Update member role
 */
export async function updateMemberRole(
  storeId: string,
  memberId: string,
  role: 'super_admin' | 'admin',
  requestingUserId: string
): Promise<void> {
  await connectToDatabase();

  // Prevent changing own role
  if (memberId === requestingUserId) {
    throw new Error('Cannot change your own role');
  }

  const member = await User.findById(memberId);
  if (!member || member.storeId.toString() !== storeId) {
    throw new Error('Member not found');
  }

  // Prevent demoting last super_admin
  if (member.role === 'super_admin' && role !== 'super_admin') {
    const superAdminCount = await User.countDocuments({
      storeId,
      role: 'super_admin',
      _id: { $ne: memberId },
    });
    if (superAdminCount === 0) {
      throw new Error('Cannot demote the last super_admin');
    }
  }

  member.role = role;
  await member.save();
}

/**
 * Get member count for a store
 */
export async function getTeamMemberCount(storeId: string): Promise<number> {
  await connectToDatabase();
  return User.countDocuments({ storeId, isActive: true });
}
