import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from 'ws';
import { v4 as uuidv4 } from 'uuid';
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { sendMeetingInvite, sendContactInvite } from "./emailService";
import { 
  insertMeetingSchema, 
  insertMeetingParticipantSchema,
  insertContactSchema,
  insertCalendarEventSchema,
  insertChatChannelSchema,
  insertChatMessageSchema
} from "@shared/schema";

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
      const userId = req.user.claims.sub;
      const meetings = await storage.getMeetingsByUser(userId);
      const contacts = await storage.getContacts(userId);
      
      const stats = {
        sessions: 12,
        securityScore: 94,
        lastLogin: "2 hours ago",
        totalMeetings: meetings.length,
        totalContacts: contacts.length,
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
            type: "meeting",
            description: "Meeting scheduled",
            timestamp: "1 day ago",
            device: null,
            icon: "fas fa-video",
            iconColor: "blue"
          },
          {
            id: 3,
            type: "contact",
            description: "New contact added",
            timestamp: "3 days ago",
            device: null,
            icon: "fas fa-user-plus",
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

  // Meeting Routes
  app.post('/api/meetings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      const meetingData = insertMeetingSchema.parse({
        ...req.body,
        hostId: userId,
        joinLink: `${req.protocol}://${req.get('host')}/meeting/${uuidv4()}`
      });
      
      const meeting = await storage.createMeeting(meetingData);
      
      // Add participants
      if (req.body.participants && req.body.participants.length > 0) {
        for (const participantEmail of req.body.participants) {
          await storage.addMeetingParticipant({
            meetingId: meeting.id,
            email: participantEmail,
            name: participantEmail.split('@')[0],
            role: 'participant'
          });
          
          // Send email invitation
          if (user) {
            await sendMeetingInvite(
              meeting.title,
              new Date(meeting.startTime).toLocaleString(),
              meeting.joinLink || '',
              `${user.firstName} ${user.lastName}` || user.email || 'Host',
              user.email || '',
              participantEmail
            );
          }
        }
      }
      
      res.json(meeting);
    } catch (error) {
      console.error("Error creating meeting:", error);
      res.status(500).json({ message: "Failed to create meeting" });
    }
  });

  app.get('/api/meetings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const meetings = await storage.getMeetingsByUser(userId);
      res.json(meetings);
    } catch (error) {
      console.error("Error fetching meetings:", error);
      res.status(500).json({ message: "Failed to fetch meetings" });
    }
  });

  app.get('/api/meetings/:id', isAuthenticated, async (req: any, res) => {
    try {
      const meeting = await storage.getMeeting(req.params.id);
      if (!meeting) {
        return res.status(404).json({ message: "Meeting not found" });
      }
      
      const participants = await storage.getMeetingParticipants(meeting.id);
      res.json({ ...meeting, participants });
    } catch (error) {
      console.error("Error fetching meeting:", error);
      res.status(500).json({ message: "Failed to fetch meeting" });
    }
  });

  // Contact Routes
  app.post('/api/contacts', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      const contactData = insertContactSchema.parse({
        ...req.body,
        userId
      });
      
      const contact = await storage.createContact(contactData);
      
      // Send contact invitation email
      if (user && req.body.sendInvite) {
        await sendContactInvite(
          `${user.firstName} ${user.lastName}` || user.email || 'User',
          user.email || '',
          contact.email,
          req.body.inviteMessage
        );
      }
      
      res.json(contact);
    } catch (error) {
      console.error("Error creating contact:", error);
      res.status(500).json({ message: "Failed to create contact" });
    }
  });

  app.get('/api/contacts', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const contacts = await storage.getContacts(userId);
      
      // Add mock status and additional fields for demo
      const enhancedContacts = contacts.map(contact => ({
        ...contact,
        status: ['online', 'away', 'busy', 'offline'][Math.floor(Math.random() * 4)],
        tags: ['colleague', 'client', 'partner'].slice(0, Math.floor(Math.random() * 3) + 1),
        lastContact: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
        isFavorite: Math.random() > 0.7
      }));
      
      // Add some demo contacts if none exist
      if (enhancedContacts.length === 0) {
        const demoContacts = [
          {
            id: "demo1",
            name: "Alice Johnson",
            email: "alice@company.com",
            phone: "+1 (555) 123-4567",
            company: "Tech Solutions Inc",
            title: "Senior Developer",
            status: "online",
            tags: ["colleague", "developer"],
            lastContact: new Date(Date.now() - 86400000).toISOString(),
            location: "San Francisco, CA",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            userId: userId,
            contactUserId: null,
            inviteMessage: null,
            isFavorite: true
          },
          {
            id: "demo2", 
            name: "Bob Smith",
            email: "bob@client.com",
            phone: "+1 (555) 987-6543",
            company: "Client Corp",
            title: "Project Manager",
            status: "busy",
            tags: ["client", "manager"],
            lastContact: new Date(Date.now() - 172800000).toISOString(),
            location: "New York, NY",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            userId: userId,
            contactUserId: null,
            inviteMessage: null,
            isFavorite: false
          }
        ];
        enhancedContacts.push(...demoContacts);
      }
      
      res.json(enhancedContacts);
    } catch (error) {
      console.error("Error fetching contacts:", error);
      res.status(500).json({ message: "Failed to fetch contacts" });
    }
  });

  app.patch('/api/contacts/:id/status', isAuthenticated, async (req: any, res) => {
    try {
      const { status } = req.body;
      const contact = await storage.updateContactStatus(req.params.id, status);
      res.json(contact);
    } catch (error) {
      console.error("Error updating contact status:", error);
      res.status(500).json({ message: "Failed to update contact status" });
    }
  });

  // Calendar Routes
  app.post('/api/calendar/events', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const eventData = insertCalendarEventSchema.parse({
        ...req.body,
        userId
      });
      
      const event = await storage.createCalendarEvent(eventData);
      res.json(event);
    } catch (error) {
      console.error("Error creating calendar event:", error);
      res.status(500).json({ message: "Failed to create calendar event" });
    }
  });

  app.get('/api/calendar/events', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { startDate, endDate } = req.query;
      
      const events = await storage.getCalendarEvents(
        userId,
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined
      );
      res.json(events);
    } catch (error) {
      console.error("Error fetching calendar events:", error);
      res.status(500).json({ message: "Failed to fetch calendar events" });
    }
  });

  // Chat Routes
  app.post('/api/chat/channels', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const channelData = insertChatChannelSchema.parse({
        ...req.body,
        createdBy: userId
      });
      
      const channel = await storage.createChatChannel(channelData);
      res.json(channel);
    } catch (error) {
      console.error("Error creating chat channel:", error);
      res.status(500).json({ message: "Failed to create chat channel" });
    }
  });

  app.get('/api/chat/channels', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      // Mock chat channels data for demo
      const channels = [
        {
          id: "general",
          name: "general",
          description: "General team discussion",
          type: "public",
          memberCount: 12,
          unreadCount: 0,
          lastActivity: new Date().toISOString(),
          createdBy: userId
        },
        {
          id: "development",
          name: "development",
          description: "Development team chat",
          type: "public",
          memberCount: 8,
          unreadCount: 2,
          lastActivity: new Date().toISOString(),
          createdBy: userId
        },
        {
          id: "announcements",
          name: "announcements",
          description: "Company announcements",
          type: "public",
          memberCount: 25,
          unreadCount: 1,
          lastActivity: new Date().toISOString(),
          createdBy: userId
        }
      ];
      res.json(channels);
    } catch (error) {
      console.error("Error fetching chat channels:", error);
      res.status(500).json({ message: "Failed to fetch chat channels" });
    }
  });

  app.get('/api/chat/messages/:channelId', isAuthenticated, async (req: any, res) => {
    try {
      const { channelId } = req.params;
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      // Mock messages data for demo
      const messages = [
        {
          id: "msg1",
          content: "Welcome to the team chat! 👋",
          authorId: userId,
          authorName: user ? `${user.firstName} ${user.lastName}` : 'User',
          authorAvatar: user?.profileImageUrl,
          channelId,
          timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
          edited: false
        },
        {
          id: "msg2",
          content: "Great to have everyone here. Looking forward to collaborating!",
          authorId: "user2",
          authorName: "Jane Smith",
          channelId,
          timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
          edited: false,
          reactions: [
            { emoji: "👍", count: 3, users: ["user1", "user2", "user3"] }
          ]
        }
      ];
      res.json(messages);
    } catch (error) {
      console.error("Error fetching chat messages:", error);
      res.status(500).json({ message: "Failed to fetch chat messages" });
    }
  });

  app.post('/api/chat/messages', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      const { content, channelId } = req.body;
      
      const newMessage = {
        id: uuidv4(),
        content,
        authorId: userId,
        authorName: user ? `${user.firstName} ${user.lastName}` : 'User',
        authorAvatar: user?.profileImageUrl,
        channelId,
        timestamp: new Date().toISOString(),
        edited: false
      };
      
      // In a real app, save to database
      // For now, just return the message
      res.json(newMessage);
    } catch (error) {
      console.error("Error sending message:", error);
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  // Social Media Connection Route
  app.get('/api/social/connect/:platform', isAuthenticated, async (req: any, res) => {
    try {
      const { platform } = req.params;
      
      if (platform === 'essentiatech') {
        // Redirect to the external social media site
        res.redirect('https://meeting.essentiatechs.com/socialmedia/');
      } else {
        res.status(400).json({ message: "Unsupported platform" });
      }
    } catch (error) {
      console.error("Error connecting to social platform:", error);
      res.status(500).json({ message: "Failed to connect to social platform" });
    }
  });

  const httpServer = createServer(app);
  
  // WebSocket setup for real-time chat
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  const clients = new Map<string, WebSocket>();
  
  wss.on('connection', (ws: WebSocket, req) => {
    console.log('New WebSocket connection established');
    
    ws.on('message', async (data) => {
      try {
        const message = JSON.parse(data.toString());
        
        switch (message.type) {
          case 'join_channel':
            // Associate this connection with a user/channel
            clients.set(message.userId, ws);
            break;
            
          case 'send_message':
            // Save message to database
            const chatMessage = await storage.sendChatMessage({
              channelId: message.channelId,
              userId: message.userId,
              content: message.content,
              messageType: message.messageType || 'text'
            });
            
            // Broadcast to all clients in the channel
            const broadcastMessage = {
              type: 'new_message',
              message: chatMessage
            };
            
            clients.forEach((client) => {
              if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(broadcastMessage));
              }
            });
            break;
            
          case 'start_call':
            // Handle video/audio call initiation
            const callMessage = {
              type: 'call_started',
              callId: message.callId,
              callType: message.callType, // 'video' or 'audio'
              initiator: message.userId,
              channelId: message.channelId
            };
            
            clients.forEach((client) => {
              if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(callMessage));
              }
            });
            break;
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });
    
    ws.on('close', () => {
      // Remove client from connections
      for (const [userId, client] of Array.from(clients.entries())) {
        if (client === ws) {
          clients.delete(userId);
          break;
        }
      }
    });
  });
  
  return httpServer;
}
