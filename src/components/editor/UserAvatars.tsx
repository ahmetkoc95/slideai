"use client";

import { UserPresence } from "@/types";

interface UserAvatarsProps {
  users: UserPresence[];
  maxVisible?: number;
}

export function UserAvatars({ users, maxVisible = 4 }: UserAvatarsProps) {
  const visibleUsers = users.slice(0, maxVisible);
  const remainingCount = users.length - maxVisible;

  if (users.length === 0) return null;

  return (
    <div className="flex items-center -space-x-2">
      {visibleUsers.map((user) => (
        <div
          key={user.id}
          className="relative"
          title={user.name}
        >
          {user.image ? (
            <img
              src={user.image}
              alt={user.name}
              className="h-8 w-8 rounded-full border-2 border-white"
            />
          ) : (
            <div
              className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white text-sm font-medium text-white"
              style={{ backgroundColor: user.color }}
            >
              {user.name?.[0] || user.email?.[0]}
            </div>
          )}
          {/* Online indicator */}
          <div
            className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-green-500"
          />
        </div>
      ))}
      
      {remainingCount > 0 && (
        <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-gray-400 text-xs font-medium text-white">
          +{remainingCount}
        </div>
      )}
    </div>
  );
}
