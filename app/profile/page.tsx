import { currentUser } from '@clerk/nextjs/server';
 
export default async function ProfilePage() {
  const user = await currentUser();
 
  if (!user) return null;
 
  return (
    <div>
      <h1>Hello, {user.firstName}!</h1>
    </div>
  );
} 