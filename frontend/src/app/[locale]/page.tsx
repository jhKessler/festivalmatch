import { getTranslations } from "next-intl/server";
import HomePage from "./Homepage.server";

export default function Home() {
  return HomePage();
}
