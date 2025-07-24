import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Get user stats for dashboard
  app.get('/api/user/stats', isAuthenticated, async (req: any, res) => {
    try {
      // Mock stats for now - in real app would fetch from database
      const stats = {
        sessions: 12,
        securityScore: 94,
        lastLogin: "2 hours ago",
        activities: [
          {
            id: 1,
            type: "login",
            description: "Successful login",
            timestamp: "2 hours ago",
            device: "Chrome on macOS",
            icon: "fas fa-sign-in-alt",
            iconColor: "green"
          },
          {
            id: 2,
            type: "profile",
            description: "Profile updated",
            timestamp: "1 day ago",
            device: null,
            icon: "fas fa-user-edit",
            iconColor: "blue"
          },
          {
            id: 3,
            type: "security",
            description: "Password changed",
            timestamp: "3 days ago",
            device: null,
            icon: "fas fa-key",
            iconColor: "purple"
          }
        ]
      };
      res.json(stats);
    } catch (error) {
      console.error("Error fetching user stats:", error);
      res.status(500).json({ message: "Failed to fetch user stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
