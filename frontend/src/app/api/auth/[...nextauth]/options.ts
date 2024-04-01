import SpotifyProvider from "next-auth/providers/spotify";
import { prepareBackendUrl, prepareFrontendUrl, prepareUrl } from "@/app/utils";

const spotifyUrl = prepareUrl("https://accounts.spotify.com/authorize", "", {
  scope: "user-top-read",
  redirect_uri: prepareFrontendUrl("/api/auth/callback/spotify"),
  response_type: "code",
});

// Define authOptions as an exported variable
export const authOptions = {
  providers: [
    SpotifyProvider({
      clientId: process.env.SPOTIFY_CLIENT_ID!,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET!,
      authorization: spotifyUrl.toString(),
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }: any) {
      // If account exists and access_token is available, save it in the token
      if (account?.access_token) {
        token.access_token = account.access_token;
      }
      if (user?.id) {
        token.user_id = user.id;
      }
      if (user?.name) {
        token.username = user.name;
      }
      return token;
    },
    async session({ session, token }: any) {
      session.access_token = token.access_token;
      session.user_id = token.user_id;
      session.username = token.username;
      return session;
    },
    async signIn({ user, account, profile }: any) {
      if (account?.provider === "spotify") {
        try {
          // @ts-ignore
          user.image = profile?.images![1].url; // Use high resolution if available
        } catch {}
        const response = await fetch(prepareBackendUrl("/api/user/"), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: user.id,
            username: user.name,
            user_picture_url: user.image,
            access_token: account.access_token,
          }),
        });
        if (process.env.NEXT_PUBLIC_MODE == "dev") {
          return response.ok;
        }
      }
      return true;
    },
  },
};
