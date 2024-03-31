"use client";

import React, { useState } from "react";
import MenuIcon from "@mui/icons-material/Menu";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";

export default function Dropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const toggleDropdown = () => setIsOpen(!isOpen);
  const { data: session, status: status } = useSession();

  return (
    <div
      className={`absolute left-0 sm:hidden p-2 rounded-t-md ${
        isOpen && "bg-black"
      }`}
    >
      <button onClick={toggleDropdown} className="px-4 py-2">
        <MenuIcon className="text-white" />
      </button>
      {isOpen && (
        <div className="absolute left-0 w-28 rounded-md p-2 rounded-t-md bg-black">
          <Link href="/" className="block px-4 py-2 text-white">
            Home
          </Link>
          {status === "authenticated" && (
            <Link href="/suggestions" className="block px-4 py-2 text-white">
              Festivals
            </Link>
          )}
          {status === "authenticated" && (
            <Link href="/crews" className="block px-4 py-2 text-white">
              Crews
            </Link>
          )}
          <Link href="/contact" className="block px-4 py-2 text-white">
            Contact
          </Link>
          <Link href="/privacy" className="block px-4 py-2 text-white">
            Privacy
          </Link>
          {status === "authenticated" && (
            <button
              className="block px-4 py-2 text-white"
              onClick={() => signOut()}
            >
              Sign out
            </button>
          )}
        </div>
      )}
    </div>
  );
}
