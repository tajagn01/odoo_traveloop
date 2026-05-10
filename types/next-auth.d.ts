import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      profilePhoto?: string | null;
      languagePreference?: string | null;
      emailVerified?: Date | null;
    };
  }

  interface User {
    languagePreference?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    profilePhoto?: string | null;
    languagePreference?: string | null;
    emailVerified?: Date | null;
  }
}
