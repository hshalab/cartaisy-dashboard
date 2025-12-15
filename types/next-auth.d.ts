import type { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user?: DefaultSession['user'] & {
      id?: string;
      storeId?: string;
      role?: 'super_admin' | 'admin';
      storeName?: string;
      accessToken?: string;
    };
  }

  interface User {
    id?: string;
    storeId?: string;
    role?: 'super_admin' | 'admin';
    storeName?: string;
    accessToken?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
    storeId?: string;
    role?: 'super_admin' | 'admin';
    storeName?: string;
    accessToken?: string;
  }
}
