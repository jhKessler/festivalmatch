import "next-auth";

declare module "next-auth" {
  /**
   * Extends the built-in session types with the access token property
   */
  interface Session {
    access_token?: string;
    user_id?: string;
    username?: string;
    ip?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    access_token?: string;
    user_id?: string;
    username?: string;
  }
}
