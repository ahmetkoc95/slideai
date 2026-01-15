"use client";

import { motion, AnimatePresence } from "framer-motion";
import { UserPresence } from "@/types";

interface CollaborationCursorsProps {
  cursors: UserPresence[];
  currentSlideId: string;
}

export function CollaborationCursors({
  cursors,
  currentSlideId,
}: CollaborationCursorsProps) {
  const activeCursors = cursors.filter(
    (c) => c.cursor && c.cursor.slideId === currentSlideId
  );

  return (
    <AnimatePresence>
      {activeCursors.map((user) => (
        <motion.div
          key={user.id}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          className="absolute pointer-events-none z-50"
          style={{
            left: `${user.cursor!.x}%`,
            top: `${user.cursor!.y}%`,
          }}
        >
          {/* Cursor */}
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            className="-translate-x-1 -translate-y-1"
          >
            <path
              d="M5.65376 12.4563L5.65376 5.65376L12.4563 5.65376L5.65376 12.4563Z"
              fill={user.color}
              stroke={user.color}
              strokeWidth="2"
            />
          </svg>

          {/* Name tag */}
          <div
            className="absolute left-4 top-0 px-2 py-0.5 rounded text-xs text-white whitespace-nowrap"
            style={{ backgroundColor: user.color }}
          >
            {user.name}
          </div>
        </motion.div>
      ))}
    </AnimatePresence>
  );
}
