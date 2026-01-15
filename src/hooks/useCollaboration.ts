"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useSession } from "next-auth/react";
import { UserPresence, SlideContent } from "@/types";

interface UseCollaborationOptions {
  presentationId: string;
  onSlideUpdate?: (data: { slideId: string; content: SlideContent }) => void;
}

export function useCollaboration({
  presentationId,
  onSlideUpdate,
}: UseCollaborationOptions) {
  const { data: session } = useSession();
  const [isConnected, setIsConnected] = useState(false);
  const [users, setUsers] = useState<UserPresence[]>([]);
  const [cursors, setCursors] = useState<Map<string, UserPresence>>(new Map());
  const socketRef = useRef<Socket | null>(null);

  // Connect to socket server
  useEffect(() => {
    if (!session?.user) return;

    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "", {
      withCredentials: true,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setIsConnected(true);
      
      // Join the presentation room
      socket.emit("join-room", {
        presentationId,
        user: {
          id: session.user.id,
          name: session.user.name,
          email: session.user.email,
          image: session.user.image,
        },
      });
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
    });

    socket.on("users-update", (updatedUsers: UserPresence[]) => {
      // Filter out current user
      setUsers(updatedUsers.filter((u) => u.id !== session.user.id));
    });

    socket.on("cursor-update", (data: UserPresence) => {
      setCursors((prev) => {
        const newCursors = new Map(prev);
        newCursors.set(data.id, data);
        return newCursors;
      });
    });

    socket.on("slide-updated", (data: { slideId: string; content: SlideContent }) => {
      onSlideUpdate?.(data);
    });

    return () => {
      socket.emit("leave-room");
      socket.disconnect();
      socketRef.current = null;
    };
  }, [session, presentationId, onSlideUpdate]);

  // Emit cursor position
  const updateCursor = useCallback(
    (x: number, y: number, slideId: string) => {
      socketRef.current?.emit("cursor-move", { x, y, slideId });
    },
    []
  );

  // Emit slide change
  const changeSlide = useCallback((slideId: string) => {
    socketRef.current?.emit("slide-change", slideId);
  }, []);

  // Emit slide content update
  const updateSlideContent = useCallback(
    (slideId: string, content: SlideContent) => {
      socketRef.current?.emit("slide-update", {
        slideId,
        content,
        userId: session?.user?.id,
      });
    },
    [session]
  );

  // Emit element selection
  const selectElement = useCallback(
    (elementId: string | null, slideId: string) => {
      socketRef.current?.emit("element-select", { elementId, slideId });
    },
    []
  );

  return {
    isConnected,
    users,
    cursors: Array.from(cursors.values()),
    updateCursor,
    changeSlide,
    updateSlideContent,
    selectElement,
  };
}
