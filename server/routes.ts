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
        startTime: new Date(req.body.startTime),
        endTime: new Date(req.body.endTime),
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
    } catch (error: any) {
      console.error("Error creating meeting:", error);
      res.status(500).json({ 
        message: "Failed to create meeting", 
        error: error.message || 'Unknown error',
        details: error.issues || [] 
      });
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

  // Contact invitation system
  app.post('/api/contacts/invite', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      const { email, name, message, contactType } = req.body;
      
      const inviteToken = uuidv4();
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
      
      // Create contact invitation record
      const invitation = {
        inviterUserId: userId,
        inviterName: user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : user?.email || 'User',
        inviterEmail: user?.email || '',
        inviteeEmail: email,
        inviteMessage: message || `${user?.firstName || 'Someone'} would like to connect with you`,
        inviteToken,
        expiresAt,
        status: 'pending'
      };
      
      // Store invitation (would normally use database)
      console.log('Contact invitation created:', invitation);
      
      // Send invitation email
      if (user) {
        try {
          await sendContactInvite(
            invitation.inviterName,
            invitation.inviterEmail,
            email,
            message || invitation.inviteMessage
          );
        } catch (emailError) {
          console.error("Failed to send invitation email:", emailError);
          return res.status(500).json({ message: "Failed to send invitation email" });
        }
      }
      
      res.json({ 
        message: "Invitation sent successfully",
        inviteToken,
        expiresAt 
      });
    } catch (error: any) {
      console.error("Error sending contact invitation:", error);
      res.status(500).json({ 
        message: "Failed to send contact invitation",
        error: error.message || 'Unknown error'
      });
    }
  });

  // Accept contact invitation
  app.post('/api/contacts/accept/:token', async (req, res) => {
    try {
      const { token } = req.params;
      const { name, phone, company, title } = req.body;
      
      // In a real app, find invitation by token and validate
      // For demo, we'll create a successful response
      res.json({ 
        message: "Contact invitation accepted successfully",
        contact: {
          id: uuidv4(),
          name: name || 'New Contact',
          email: req.body.email || 'contact@example.com',
          phone,
          company,
          title,
          status: 'accepted',
          acceptedAt: new Date().toISOString()
        }
      });
    } catch (error: any) {
      console.error("Error accepting contact invitation:", error);
      res.status(500).json({ 
        message: "Failed to accept contact invitation",
        error: error.message || 'Unknown error'
      });
    }
  });

  // Contact Routes
  app.post('/api/contacts', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      const contactData = insertContactSchema.parse({
        ...req.body,
        userId,
        tags: req.body.tags || [],
        status: req.body.status || 'offline',
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      const contact = await storage.createContact(contactData);
      
      // Send contact invitation email
      if (user && req.body.sendInvite) {
        try {
          await sendContactInvite(
            `${user.firstName} ${user.lastName}` || user.email || 'User',
            user.email || '',
            contact.email,
            req.body.inviteMessage
          );
        } catch (emailError) {
          console.error("Failed to send invitation email:", emailError);
          // Don't fail contact creation if email fails
        }
      }
      
      res.json(contact);
    } catch (error: any) {
      console.error("Error creating contact:", error);
      res.status(500).json({ 
        message: "Failed to create contact",
        error: error.message || 'Unknown error',
        details: error.issues || []
      });
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
            createdAt: new Date(),
            updatedAt: new Date(),
            userId: userId,
            contactUserId: null,
            inviteMessage: null,
            inviteToken: null,
            invitedAt: null,
            acceptedAt: null,
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
            createdAt: new Date(),
            updatedAt: new Date(),
            userId: userId,
            contactUserId: null,
            inviteMessage: null,
            inviteToken: null,
            invitedAt: null,
            acceptedAt: null,
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

  // Calendar sync endpoint
  app.post('/api/calendar/sync', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      // Simulate syncing with external calendars (Google, Outlook)
      const syncResults = {
        googleCalendar: {
          connected: true,
          eventsSynced: Math.floor(Math.random() * 10) + 1,
          lastSync: new Date().toISOString()
        },
        outlookCalendar: {
          connected: true,
          eventsSynced: Math.floor(Math.random() * 8) + 1,
          lastSync: new Date().toISOString()
        }
      };
      
      // In a real app, you would:
      // 1. Fetch events from Google Calendar API
      // 2. Fetch events from Microsoft Graph API
      // 3. Merge and deduplicate events
      // 4. Update local database
      
      console.log(`Calendar sync completed for user ${userId}:`, syncResults);
      
      res.json({
        message: "Calendar sync completed successfully",
        results: syncResults,
        totalEventsSynced: syncResults.googleCalendar.eventsSynced + syncResults.outlookCalendar.eventsSynced
      });
    } catch (error) {
      console.error("Error syncing calendars:", error);
      res.status(500).json({ message: "Failed to sync calendars" });
    }
  });

  // Chat Routes
  app.post('/api/chat/channels', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      const { name, description, type = 'public', participants = [] } = req.body;
      
      const newChannel = {
        id: uuidv4(),
        name: name.toLowerCase().replace(/\s+/g, '-'),
        displayName: name,
        description,
        type,
        createdBy: userId,
        isArchived: false,
        memberCount: participants.length + 1, // include creator
        unreadCount: 0,
        lastActivity: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Send invitations to participants if provided
      if (participants.length > 0 && user) {
        for (const email of participants) {
          try {
            // Here you would send invitation emails
            // For now, we'll just log it
            console.log(`Sending channel invitation to ${email} for channel ${name}`);
          } catch (emailError) {
            console.error(`Failed to send invitation to ${email}:`, emailError);
          }
        }
      }
      
      res.json(newChannel);
    } catch (error: any) {
      console.error("Error creating chat channel:", error);
      res.status(500).json({ 
        message: "Failed to create chat channel",
        error: error.message || 'Unknown error'
      });
    }
  });

  app.get('/api/chat/channels', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      // Mock chat channels data for demo with member lists
      const channels = [
        {
          id: "general",
          name: "general",
          displayName: "General",
          description: "General team discussion",
          type: "public",
          memberCount: 12,
          unreadCount: 0,
          lastActivity: new Date().toISOString(),
          createdBy: userId,
          members: [
            { id: userId, name: "You", status: "online", role: "admin" },
            { id: "user2", name: "Alice Johnson", status: "online", role: "member" },
            { id: "user3", name: "Bob Smith", status: "away", role: "member" },
            { id: "user4", name: "Carol Davis", status: "busy", role: "member" }
          ]
        },
        {
          id: "development",
          name: "development", 
          displayName: "Development",
          description: "Development team chat",
          type: "public",
          memberCount: 8,
          unreadCount: 2,
          lastActivity: new Date().toISOString(),
          createdBy: userId,
          members: [
            { id: userId, name: "You", status: "online", role: "admin" },
            { id: "user2", name: "Alice Johnson", status: "online", role: "member" },
            { id: "user5", name: "David Wilson", status: "offline", role: "member" }
          ]
        },
        {
          id: "announcements",
          name: "announcements",
          displayName: "Announcements", 
          description: "Company announcements",
          type: "public",
          memberCount: 25,
          unreadCount: 1,
          lastActivity: new Date().toISOString(),
          createdBy: userId,
          members: [
            { id: userId, name: "You", status: "online", role: "admin" },
            { id: "user2", name: "Alice Johnson", status: "online", role: "member" },
            { id: "user3", name: "Bob Smith", status: "away", role: "member" }
          ]
        }
      ];
      res.json(channels);
    } catch (error: any) {
      console.error("Error fetching chat channels:", error);
      res.status(500).json({ 
        message: "Failed to fetch chat channels",
        error: error.message || 'Unknown error'
      });
    }
  });

  // Enhanced chat message endpoint with real-time features  
  app.get('/api/chat/messages/:channelId', isAuthenticated, async (req: any, res) => {
    try {
      const { channelId } = req.params;
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      // Enhanced mock messages with reactions and real-time simulation
      const messages = [
        {
          id: "msg1",
          content: "Welcome to the team chat! 👋 Great to have everyone here.",
          authorId: userId,
          authorName: user ? `${user.firstName} ${user.lastName}` : 'User',
          authorAvatar: user?.profileImageUrl,
          channelId,
          timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
          edited: false,
          reactions: [
            { emoji: "👋", count: 3, users: [userId, "user2", "user3"] },
            { emoji: "❤️", count: 2, users: ["user4", "user5"] }
          ]
        },
        {
          id: "msg2", 
          content: "Looking forward to collaborating! Let's make this channel productive 🚀",
          authorId: "user2",
          authorName: "Alice Johnson",
          channelId,
          timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
          edited: false,
          reactions: [
            { emoji: "🚀", count: 4, users: [userId, "user3", "user4", "user5"] },
            { emoji: "👍", count: 2, users: [userId, "user3"] }
          ]
        },
        {
          id: "msg3",
          content: "Has anyone reviewed the project specifications? I have some feedback 📝",
          authorId: "user3",
          authorName: "Bob Smith", 
          channelId,
          timestamp: new Date(Date.now() - 1800000).toISOString(), // 30 minutes ago
          edited: false,
          reactions: [
            { emoji: "📝", count: 1, users: ["user2"] }
          ]
        }
      ];
      
      res.json(messages);
    } catch (error) {
      console.error("Error fetching chat messages:", error);
      res.status(500).json({ message: "Failed to fetch chat messages" });
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
      const { content, channelId, fileUrl, fileType, fileName } = req.body;
      
      const newMessage = {
        id: uuidv4(),
        content,
        authorId: userId,
        authorName: user ? `${user.firstName} ${user.lastName}` : 'User',
        authorAvatar: user?.profileImageUrl,
        channelId,
        timestamp: new Date().toISOString(),
        edited: false,
        fileUrl: fileUrl || null,
        fileType: fileType || null,
        fileName: fileName || null,
        reactions: []
      };
      
      // In a real app, save to database
      // For now, just return the message
      res.json(newMessage);
    } catch (error: any) {
      console.error("Error sending message:", error);
      res.status(500).json({ 
        message: "Failed to send message",
        error: error.message || 'Unknown error'
      });
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
