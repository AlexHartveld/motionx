import { Metadata } from 'next';
import { auth } from '@clerk/nextjs';
import { ProfileSettings } from '@/components/profile/profile-settings';
import { ProfileStats } from '@/components/profile/profile-stats';

export const metadata: Metadata = {
  title: 'Profile & Statistics',
  description: 'View your productivity statistics and manage your settings',
};

export default async function ProfilePage() {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  return (
    <main className="container max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col gap-8">
        {/* Header Section */}
        <div>
          <h1 className="text-4xl font-bold">Profile & Statistics</h1>
          <p className="text-muted-foreground mt-2">
            Manage your preferences and view your productivity insights
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Stats Section - Takes up 2 columns on large screens */}
          <div className="lg:col-span-2 space-y-8">
            <ProfileStats />
          </div>

          {/* Settings Section - Takes up 1 column */}
          <div className="space-y-6">
            <ProfileSettings />
          </div>
        </div>
      </div>
    </main>
  );
} 