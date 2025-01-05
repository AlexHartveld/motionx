'use client';

import { useState } from 'react';
import { UserButton, SignInButton, SignUpButton, useClerk } from "@clerk/nextjs";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Moon, Sun, LogOut } from 'lucide-react';
import { Button } from "@/components/ui/button";

export default function NavBar() {
  const { isSignedIn } = useAuth();
  const { signOut } = useClerk();
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      window.location.href = '/';
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };
  
  return (
    <nav className="fixed top-0 w-full bg-white dark:bg-gray-900 border-b shadow-sm">
      <div className="container flex items-center justify-between h-16 px-4 mx-auto">
        <Link href="/" className="text-2xl font-bold brutalist-border p-2 bg-blue-300 dark:bg-blue-600">
          ROUTINA
        </Link>
        
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            onClick={toggleDarkMode}
            className="brutalist-border brutalist-hover"
            size="icon"
          >
            {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
          {isSignedIn ? (
            <>
              <Link href="/profile" className="text-sm hover:text-gray-600">
                Profile
              </Link>
              <Button
                variant="ghost"
                onClick={handleSignOut}
                className="flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign out</span>
              </Button>
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