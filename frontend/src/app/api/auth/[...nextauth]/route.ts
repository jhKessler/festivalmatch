import NextAuth from "next-auth";
import { authOptions } from "./options";

const handler = NextAuth(authOptions);

// Export the auth function for GET and POST requests
export { handler as GET, handler as POST };
