'use client';

import { UserButton, SignInButton, SignUpButton } from "@clerk/nextjs";
import { useAuth } from "@clerk/nextjs";
import Link from "next/link";

export default function NavBar() {
  const { isSignedIn } = useAuth();
  
  return (
    <nav className="fixed top-0 w-full bg-white border-b shadow-sm">
      <div className="container flex items-center justify-between h-16 px-4 mx-auto">
        <Link href="/" className="text-xl font-bold">
          MotionX
        </Link>
        
        <div className="flex items-center gap-4">
          {isSignedIn ? (
            <>
              <Link href="/profile" className="text-sm hover:text-gray-600">
                Profile
              </Link>
              <UserButton afterSignOutUrl="/" />
            </>
          ) : (
            <>
              <SignInButton mode="modal">
                <button className="text-sm hover:text-gray-600">
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="px-4 py-2 text-sm text-white bg-black rounded-md hover:bg-gray-800">
                  Sign Up
                </button>
              </SignUpButton>
            </>
          )}
        </div>
      </div>
    </nav>
  );
} 