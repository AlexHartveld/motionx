import { auth } from '@clerk/nextjs';

export const getCurrentUser = async () => {
  const { userId } = await auth();
  
  if (!userId) {
    return null;
  }

  return { id: userId };
}; 