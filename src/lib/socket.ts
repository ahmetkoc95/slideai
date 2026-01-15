import { Server as HTTPServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { generateUserColor } from "./utils";

interface UserPresence {
  id: string;
  name: string;
  email: string;
  image?: string;
  color: string;
  cursor?: {
    x: number;
    y: number;
    slideId: string;
  };
  activeSlideId?: string;
}

interface RoomState {
  users: Map<string, UserPresence>;
  presentationId: string;
}

const rooms = new Map<string, RoomState>();

export function initSocketServer(httpServer: HTTPServer): SocketIOServer {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.NEXTAUTH_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    let currentRoom: string | null = null;
    let currentUser: UserPresence | null = null;

    // Join a presentation room
    socket.on("join-room", (data: { presentationId: string; user: { id: string; name: string; email: string; image?: string } }) => {
      const { presentationId, user } = data;
      currentRoom = presentationId;
      
      // Create user presence
      currentUser = {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        color: generateUserColor(),
      };

      // Join socket room
      socket.join(presentationId);

      // Initialize room if needed
      if (!rooms.has(presentationId)) {
        rooms.set(presentationId, {
          users: new Map(),
          presentationId,
        });
      }

      // Add user to room
      const room = rooms.get(presentationId)!;
      room.users.set(socket.id, currentUser);

      // Broadcast user joined
      io.to(presentationId).emit("users-update", Array.from(room.users.values()));

      console.log(`User ${user.name} joined room ${presentationId}`);
    });

    // Leave room
    socket.on("leave-room", () => {
      if (currentRoom) {
        handleLeaveRoom();
      }
    });

    // Cursor movement
    socket.on("cursor-move", (data: { x: number; y: number; slideId: string }) => {
      if (!currentRoom || !currentUser) return;

      currentUser.cursor = data;
      
      const room = rooms.get(currentRoom);
      if (room) {
        room.users.set(socket.id, currentUser);
        socket.to(currentRoom).emit("cursor-update", {
          socketId: socket.id,
          ...currentUser,
        });
      }
    });

    // Active slide change
    socket.on("slide-change", (slideId: string) => {
      if (!currentRoom || !currentUser) return;

      currentUser.activeSlideId = slideId;
      
      const room = rooms.get(currentRoom);
      if (room) {
        room.users.set(socket.id, currentUser);
        io.to(currentRoom).emit("users-update", Array.from(room.users.values()));
      }
    });

    // Slide content update
    socket.on("slide-update", (data: { slideId: string; content: object; userId: string }) => {
      if (!currentRoom) return;

      // Broadcast to other users in the room
      socket.to(currentRoom).emit("slide-updated", data);
    });

    // Element selection
    socket.on("element-select", (data: { elementId: string | null; slideId: string }) => {
      if (!currentRoom) return;

      socket.to(currentRoom).emit("element-selected", {
        socketId: socket.id,
        userId: currentUser?.id,
        ...data,
      });
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      handleLeaveRoom();
      console.log("User disconnected:", socket.id);
    });

    function handleLeaveRoom() {
      if (!currentRoom) return;

      const room = rooms.get(currentRoom);
      if (room) {
        room.users.delete(socket.id);
        
        // Broadcast user left
        io.to(currentRoom).emit("users-update", Array.from(room.users.values()));

        // Clean up empty rooms
        if (room.users.size === 0) {
          rooms.delete(currentRoom);
        }
      }

      socket.leave(currentRoom);
      currentRoom = null;
      currentUser = null;
    }
  });

  return io;
}
