import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { verifyAdminCredentials } from '@/lib/auth-credentials';
import { validateServerEnv } from '@/lib/env';

validateServerEnv();

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const email = credentials?.email;
        const password = credentials?.password;
        if (typeof email !== 'string' || typeof password !== 'string') return null;
        if (!verifyAdminCredentials(email, password)) return null;
        const adminEmail = process.env.ADMIN_EMAIL!.trim().toLowerCase();
        return { id: 'admin', email: adminEmail };
      },
    }),
  ],
  session: { strategy: 'jwt' },
  pages: { signIn: '/admin' },
  callbacks: {
    async jwt({ token, user }) {
      if (user?.email) token.email = user.email;
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.email) {
        session.user.email = token.email as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
