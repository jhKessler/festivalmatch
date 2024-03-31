import Link from "next/link";

export default function GetStartedButton() {
  return (
    <Link
      href="/signup"
      className="bg-purple hover:bg-purple-dimmed p-4 rounded-md transition-colors duration-300 "
    >
      Get started
    </Link>
  );
}
