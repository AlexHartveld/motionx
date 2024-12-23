'use client';

export default function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="relative w-24 h-24">
        {/* Outer circle */}
        <div className="absolute inset-0 border-4 border-t-blue-500 border-r-pink-500 border-b-green-500 border-l-yellow-500 rounded-full animate-spin" />
        
        {/* Inner circle */}
        <div className="absolute inset-2 border-4 border-t-yellow-500 border-r-blue-500 border-b-pink-500 border-l-green-500 rounded-full animate-spin-reverse" />
        
        {/* Center dot */}
        <div className="absolute inset-[38%] bg-purple-500 rounded-full animate-pulse" />
      </div>
      
      <div className="mt-4 text-lg font-medium text-gray-600 animate-bounce">
        Loading awesome habits...
      </div>
      
      {/* Fun emoji */}
      <div className="mt-2 text-2xl animate-bounce delay-100">
        🚀
      </div>
    </div>
  );
} 