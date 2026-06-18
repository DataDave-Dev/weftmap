import NextAuth, { type DefaultSession } from "next-auth";
import GitHub from "next-auth/providers/github";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { accounts, sessions, users, verificationTokens } from "@/db/schema";

declare module "next-auth" {
  interface Session {
    user: { id: string; username?: string | null } & DefaultSession["user"];
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  providers: [
    GitHub({
      // Capture the GitHub handle (login) into our users.username column.
      profile(profile) {
        return {
          id: profile.id.toString(),
          name: profile.name,
          email: profile.email,
          image: profile.avatar_url,
          username: profile.login,
        };
      },
    }),
  ],
  callbacks: {
    // Database session strategy exposes the adapter user; surface id + username.
    session({ session, user }) {
      session.user.id = user.id;
      session.user.username =
        (user as { username?: string | null }).username ?? null;
      return session;
    },
  },
  events: {
    // The adapter only stores profile fields on user creation. Refresh the
    // GitHub handle on every sign-in so existing accounts get backfilled too.
    async signIn({ user, profile }) {
      const login = profile?.login;
      if (user.id && typeof login === "string") {
        await db
          .update(users)
          .set({ username: login })
          .where(eq(users.id, user.id));
      }
    },
  },
});
