import NextAuth from 'next-auth';
import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { connectToDatabase } from '@/lib/db';
import { User } from '@/models/User';

export const authConfig: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required');
        }

        await connectToDatabase();

        // Only query USERS collection (dashboard admins)
        // Do NOT query customers collection
        const user = await User.findOne({
          email: credentials.email.toLowerCase(),
        });

        if (!user) {
          throw new Error('Invalid email or password');
        }

        // Verify this is an admin user with valid role
        if (!user.role || !['super_admin', 'admin'].includes(user.role)) {
          throw new Error('Access denied. Dashboard is for administrators only.');
        }

        // Verify user is active
        if (user.isActive === false) {
          throw new Error('Account is inactive. Please contact your administrator.');
        }

        // Verify user has a storeId
        if (!user.storeId) {
          throw new Error('Account configuration error. Please contact support.');
        }

        // Verify password
        const isValid = await user.comparePassword(credentials.password);
        if (!isValid) {
          throw new Error('Invalid email or password');
        }

        // Update last login
        await User.findByIdAndUpdate(user._id, { lastLoginAt: new Date() });

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name || undefined,
          role: user.role,
          storeId: user.storeId.toString(),
          storeName: user.storeName || undefined,
        };
      },
    }),
  ],
  pages: {
    signIn: '/login',
    signOut: '/login',
  },
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.id = user.id;
        token.storeId = user.storeId;
        token.role = user.role;
        token.storeName = user.storeName;
      }
      return token;
    },
    async session({ session, token }: any) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.storeId = token.storeId as string;
        session.user.role = token.role as string;
        session.user.storeName = token.storeName as string;
      }
      return session;
    },
  },
};

const handler = NextAuth(authConfig);

export const GET = handler;
export const POST = handler;
