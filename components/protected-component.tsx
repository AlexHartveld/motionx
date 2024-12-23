'use client'
 
import { useAuth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
 
export default function ProtectedComponent() {
  const { userId } = useAuth();
 
  if (!userId) {
    redirect("/sign-in");
  }
 
  return <div>This is a protected component</div>;
} 