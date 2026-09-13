import React from 'react';
import logo from '../assets/logo.png'; // এখানে তোমার octopus লোগো ইমেজ রাখবে

interface ProfileCardProps {
  completed: number;
  total: number;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ completed, total }) => {
  const user = window.Telegram?.WebApp?.initDataUnsafe?.user;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between bg-gray-900 rounded-lg p-3 shadow-lg mx-auto">
        {/* Left side: Logo + Info */}
        <div className="flex items-center gap-3">
          <img src={logo} alt="logo" className="h-12 w-12 rounded-2xl object-cover" />
          <div className="flex flex-col items-start justify-start">
            <h3 className="text-h1 text-white">
              {user?.first_name} {user?.last_name || ''}
            </h3>
            <p className="text-sm text-gray-400">@{user?.username || 'Unknown User'}</p>
          </div>
        </div>

        {/* Right side: Progress */}
        <div className="rounded-full border border-violet-500/40 bg-violet-500/10 px-4 py-1">
          <span className="text-sm font-bold text-violet-400">{completed}</span>
          <span className="mx-1 text-slate-500">/</span>
          <span className="text-sm font-bold text-white">{total}</span>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
