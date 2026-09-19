import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./prisma";
import { authConfig } from "@/auth.config";
import bcrypt from "bcryptjs";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma as any),
  session: {
    strategy: "jwt",
  },
  providers: [
    ...authConfig.providers, // Maintain google
    Credentials({
      name: "Đăng nhập với Email",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mật khẩu", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const email = (credentials.email as string).trim().toLowerCase();
        const user = await prisma.users.findFirst({
          where: {
            OR: [
              { email: email },
              { email: credentials.email as string }
            ]
          }
        });

        if (!user || !user.password) return null;

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!isValid) return null;

        return user;
      }
    })
  ],
  callbacks: {
    ...authConfig.callbacks,
    async session({ session, token }) {
      if (session.user && token) {
        // Since we use JWT strategy, session.user is populated by jwt callback
        (session.user as any).id = token.id as string;
        (session.user as any).role = token.role as string;
        (session.user as any).status = token.status as string;
        (session.user as any).isAdmin = !!token.isAdmin;
        (session.user as any).isOrganization = !!token.isOrganization;
      }
      return session;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.status = (user as any).status;
        token.isAdmin = (user as any).isAdmin;
        token.isOrganization = (user as any).isOrganization;
      }
      // Client gọi update({ role }) sau nộp hồ sơ — không query DB ở Edge middleware.
      if (trigger === "update" && session) {
        const next = session as Record<string, unknown>;
        if (typeof next.role === "string") token.role = next.role;
        if (typeof next.status === "string") token.status = next.status;
        if (typeof next.isOrganization === "boolean") token.isOrganization = next.isOrganization;
        if (typeof next.isAdmin === "boolean") token.isAdmin = next.isAdmin;
      }
      return token;
    }
  },
});

export const getUser = async () => {
  const session = await auth();
  if (!session?.user) return null;
  return session.user as any;
};
