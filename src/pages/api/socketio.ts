import { NextApiRequest, NextApiResponse } from "next";
import { notificationService } from "@/lib/websocket";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (res.socket.server.io) {
    console.log("Socket.IO server already initialized");
    res.end();
    return;
  }

  try {
    notificationService.initialize(res.socket.server);
    console.log("✅ Socket.IO server initialized successfully");
  } catch (error) {
    console.error("❌ Failed to initialize Socket.IO server:", error);
  }

  res.end();
}
