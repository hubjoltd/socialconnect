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
      res.json(contacts);
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
      const channels = await storage.getChatChannels(userId);
      res.json(channels);
    } catch (error) {
      console.error("Error fetching chat channels:", error);
      res.status(500).json({ message: "Failed to fetch chat channels" });
    }
  });

  app.get('/api/chat/channels/:channelId/messages', isAuthenticated, async (req: any, res) => {
    try {
      const { channelId } = req.params;
      const { limit } = req.query;
      
      const messages = await storage.getChatMessages(channelId, limit ? parseInt(limit as string) : undefined);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching chat messages:", error);
      res.status(500).json({ message: "Failed to fetch chat messages" });
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
      for (const [userId, client] of clients.entries()) {
        if (client === ws) {
          clients.delete(userId);
          break;
        }
      }
    });
  });
  
  return httpServer;
}
