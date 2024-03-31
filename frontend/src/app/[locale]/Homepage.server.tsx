import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]/options";
import UserDashboard from "./UserDashboard";
import WelcomePage from "./Welcome.server";

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  if (session) {
    return <UserDashboard />;
  } else {
    return <WelcomePage />;
  }
}
