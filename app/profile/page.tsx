'use client';

import { ProfileSettings } from '@/components/profile/profile-settings';
import { ProfileStats } from '@/components/profile/profile-stats';

export default function ProfilePage() {
  return (
    <main className="container mx-auto px-4 py-20 space-y-8 max-w-7xl">
      <h1 className="text-3xl font-bold">Profile</h1>
      <div className="grid gap-8">
        <ProfileStats />
        <ProfileSettings />
      </div>
    </main>
  );
} 