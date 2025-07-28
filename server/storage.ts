import {
  type User,
  type UpsertUser,
  type Meeting,
  type InsertMeeting,
  type MeetingParticipant,
  type InsertMeetingParticipant,
  type Contact,
  type InsertContact,
  type CalendarEvent,
  type InsertCalendarEvent,
  type ChatChannel,
  type InsertChatChannel,
  type ChatMessage,
  type InsertChatMessage,
  type SocialConnection,
  type InsertSocialConnection,
} from "@shared/schema";
import { v4 as uuidv4 } from 'uuid';

// Interface for storage operations
export interface IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Meeting operations
  createMeeting(meeting: InsertMeeting): Promise<Meeting>;
  getMeeting(id: string): Promise<Meeting | undefined>;
  getMeetingsByUser(userId: string): Promise<Meeting[]>;
  updateMeeting(id: string, meeting: Partial<InsertMeeting>): Promise<Meeting>;
  deleteMeeting(id: string): Promise<void>;
  
  // Meeting participant operations
  addMeetingParticipant(participant: InsertMeetingParticipant): Promise<MeetingParticipant>;
  getMeetingParticipants(meetingId: string): Promise<MeetingParticipant[]>;
  updateParticipantStatus(meetingId: string, email: string, status: string): Promise<void>;
  
  // Contact operations
  createContact(contact: InsertContact): Promise<Contact>;
  getContacts(userId: string): Promise<Contact[]>;
  updateContactStatus(contactId: string, status: string): Promise<Contact>;
  deleteContact(contactId: string): Promise<void>;
  
  // Calendar operations
  createCalendarEvent(event: InsertCalendarEvent): Promise<CalendarEvent>;
  getCalendarEvents(userId: string, startDate?: Date, endDate?: Date): Promise<CalendarEvent[]>;
  updateCalendarEvent(id: string, event: Partial<InsertCalendarEvent>): Promise<CalendarEvent>;
  deleteCalendarEvent(id: string): Promise<void>;
  
  // Chat operations
  createChatChannel(channel: InsertChatChannel): Promise<ChatChannel>;
  getChatChannels(userId: string): Promise<ChatChannel[]>;
  getChatMessages(channelId: string, limit?: number): Promise<ChatMessage[]>;
  sendChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  
  // Social connections
  createSocialConnection(connection: InsertSocialConnection): Promise<SocialConnection>;
  getSocialConnections(userId: string): Promise<SocialConnection[]>;
  updateSocialConnection(id: string, connection: Partial<InsertSocialConnection>): Promise<SocialConnection>;
}

export class MemoryStorage implements IStorage {
  private users = new Map<string, User>();
  private meetings = new Map<string, Meeting>();
  private meetingParticipants = new Map<string, MeetingParticipant[]>();
  private contacts = new Map<string, Contact[]>();
  private calendarEvents = new Map<string, CalendarEvent[]>();
  private chatChannels = new Map<string, ChatChannel>();
  private chatMessages = new Map<string, ChatMessage[]>();
  private socialConnections = new Map<string, SocialConnection[]>();

  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const now = new Date();
    const existingUser = this.users.get(userData.id);
    
    const user: User = {
      id: userData.id,
      email: userData.email || null,
      firstName: userData.firstName || null,
      lastName: userData.lastName || null,
      profileImageUrl: userData.profileImageUrl || null,
      createdAt: existingUser?.createdAt || now,
      updatedAt: now,
    };
    
    this.users.set(userData.id, user);
    return user;
  }

  // Meeting operations
  async createMeeting(meeting: InsertMeeting): Promise<Meeting> {
    const now = new Date();
    const created: Meeting = {
      id: uuidv4(),
      title: meeting.title,
      description: meeting.description || null,
      startTime: meeting.startTime,
      endTime: meeting.endTime,
      timezone: meeting.timezone || "UTC",
      meetingType: meeting.meetingType || "scheduled",
      joinLink: meeting.joinLink || null,
      hostId: meeting.hostId,
      maxParticipants: meeting.maxParticipants || "100",
      waitingRoom: meeting.waitingRoom || true,
      requirePassword: meeting.requirePassword || false,
      password: meeting.password || null,
      recordMeeting: meeting.recordMeeting || false,
      muteOnEntry: meeting.muteOnEntry || true,
      hostVideo: meeting.hostVideo || true,
      participantVideo: meeting.participantVideo || false,
      createdAt: now,
      updatedAt: now,
    };
    this.meetings.set(created.id, created);
    return created;
  }

  async getMeeting(id: string): Promise<Meeting | undefined> {
    return this.meetings.get(id);
  }

  async getMeetingsByUser(userId: string): Promise<Meeting[]> {
    return Array.from(this.meetings.values())
      .filter(meeting => meeting.hostId === userId)
      .sort((a, b) => b.startTime.getTime() - a.startTime.getTime());
  }

  async updateMeeting(id: string, meeting: Partial<InsertMeeting>): Promise<Meeting> {
    const existing = this.meetings.get(id);
    if (!existing) {
      throw new Error('Meeting not found');
    }
    const updated: Meeting = {
      ...existing,
      ...meeting,
      updatedAt: new Date(),
    };
    this.meetings.set(id, updated);
    return updated;
  }

  async deleteMeeting(id: string): Promise<void> {
    this.meetings.delete(id);
    this.meetingParticipants.delete(id);
  }

  // Meeting participant operations
  async addMeetingParticipant(participant: InsertMeetingParticipant): Promise<MeetingParticipant> {
    const now = new Date();
    const created: MeetingParticipant = {
      id: uuidv4(),
      meetingId: participant.meetingId,
      email: participant.email,
      name: participant.name || null,
      role: participant.role || "participant",
      inviteStatus: participant.inviteStatus || "pending",
      joinedAt: participant.joinedAt || null,
      leftAt: participant.leftAt || null,
      createdAt: now,
    };
    
    const participants = this.meetingParticipants.get(participant.meetingId) || [];
    participants.push(created);
    this.meetingParticipants.set(participant.meetingId, participants);
    return created;
  }

  async getMeetingParticipants(meetingId: string): Promise<MeetingParticipant[]> {
    return this.meetingParticipants.get(meetingId) || [];
  }

  async updateParticipantStatus(meetingId: string, email: string, status: string): Promise<void> {
    const participants = this.meetingParticipants.get(meetingId) || [];
    const participant = participants.find(p => p.email === email);
    if (participant) {
      participant.inviteStatus = status;
    }
  }

  // Contact operations
  async createContact(contact: InsertContact): Promise<Contact> {
    const now = new Date();
    const created: Contact = {
      id: uuidv4(),
      userId: contact.userId,
      contactUserId: contact.contactUserId || null,
      email: contact.email,
      name: contact.name,
      phone: contact.phone || null,
      company: contact.company || null,
      title: contact.title || null,
      location: contact.location || null,
      status: contact.status || "pending",
      inviteMessage: contact.inviteMessage || null,
      inviteToken: contact.inviteToken || null,
      invitedAt: contact.invitedAt || null,
      acceptedAt: contact.acceptedAt || null,
      tags: contact.tags || [],
      isFavorite: contact.isFavorite || false,
      lastContact: contact.lastContact || now,
      createdAt: now,
      updatedAt: now,
    };
    
    const userContacts = this.contacts.get(contact.userId) || [];
    userContacts.push(created);
    this.contacts.set(contact.userId, userContacts);
    return created;
  }

  async getContacts(userId: string): Promise<Contact[]> {
    const contacts = this.contacts.get(userId) || [];
    return contacts.sort((a, b) => a.name.localeCompare(b.name));
  }

  async updateContactStatus(contactId: string, status: string): Promise<Contact> {
    for (const [userId, userContacts] of this.contacts.entries()) {
      const contact = userContacts.find(c => c.id === contactId);
      if (contact) {
        contact.status = status;
        contact.updatedAt = new Date();
        return contact;
      }
    }
    throw new Error('Contact not found');
  }

  async deleteContact(contactId: string): Promise<void> {
    for (const [userId, userContacts] of this.contacts.entries()) {
      const index = userContacts.findIndex(c => c.id === contactId);
      if (index !== -1) {
        userContacts.splice(index, 1);
        return;
      }
    }
  }

  // Calendar operations
  async createCalendarEvent(event: InsertCalendarEvent): Promise<CalendarEvent> {
    const now = new Date();
    const created: CalendarEvent = {
      id: uuidv4(),
      userId: event.userId,
      title: event.title,
      description: event.description || null,
      startTime: event.startTime,
      endTime: event.endTime,
      timezone: event.timezone || "UTC",
      location: event.location || null,
      eventType: event.eventType || "meeting",
      googleEventId: event.googleEventId || null,
      outlookEventId: event.outlookEventId || null,
      recurrence: event.recurrence || null,
      attendees: event.attendees || null,
      createdAt: now,
      updatedAt: now,
    };
    
    const userEvents = this.calendarEvents.get(event.userId) || [];
    userEvents.push(created);
    this.calendarEvents.set(event.userId, userEvents);
    return created;
  }

  async getCalendarEvents(userId: string, startDate?: Date, endDate?: Date): Promise<CalendarEvent[]> {
    const events = this.calendarEvents.get(userId) || [];
    return events.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
  }

  async updateCalendarEvent(id: string, event: Partial<InsertCalendarEvent>): Promise<CalendarEvent> {
    for (const [userId, userEvents] of this.calendarEvents.entries()) {
      const calendarEvent = userEvents.find(e => e.id === id);
      if (calendarEvent) {
        Object.assign(calendarEvent, event, { updatedAt: new Date() });
        return calendarEvent;
      }
    }
    throw new Error('Calendar event not found');
  }

  async deleteCalendarEvent(id: string): Promise<void> {
    for (const [userId, userEvents] of this.calendarEvents.entries()) {
      const index = userEvents.findIndex(e => e.id === id);
      if (index !== -1) {
        userEvents.splice(index, 1);
        return;
      }
    }
  }

  // Chat operations
  async createChatChannel(channel: InsertChatChannel): Promise<ChatChannel> {
    const now = new Date();
    const created: ChatChannel = {
      id: uuidv4(),
      name: channel.name,
      displayName: channel.displayName,
      description: channel.description || null,
      type: channel.type || "public",
      createdBy: channel.createdBy,
      isArchived: channel.isArchived || false,
      createdAt: now,
      updatedAt: now,
    };
    this.chatChannels.set(created.id, created);
    return created;
  }

  async getChatChannels(userId: string): Promise<ChatChannel[]> {
    return Array.from(this.chatChannels.values())
      .filter(channel => channel.createdBy === userId);
  }

  async getChatMessages(channelId: string, limit: number = 50): Promise<ChatMessage[]> {
    const messages = this.chatMessages.get(channelId) || [];
    return messages
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0))
      .slice(0, limit);
  }

  async sendChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const now = new Date();
    const created: ChatMessage = {
      id: uuidv4(),
      channelId: message.channelId,
      userId: message.userId,
      content: message.content,
      messageType: message.messageType || "text",
      fileUrl: message.fileUrl || null,
      fileName: message.fileName || null,
      fileSize: message.fileSize || null,
      replyToMessageId: message.replyToMessageId || null,
      isEdited: message.isEdited || false,
      isDeleted: message.isDeleted || false,
      createdAt: now,
      updatedAt: now,
    };
    
    const channelMessages = this.chatMessages.get(message.channelId) || [];
    channelMessages.push(created);
    this.chatMessages.set(message.channelId, channelMessages);
    return created;
  }

  // Social connections
  async createSocialConnection(connection: InsertSocialConnection): Promise<SocialConnection> {
    const now = new Date();
    const created: SocialConnection = {
      id: uuidv4(),
      userId: connection.userId,
      platform: connection.platform,
      platformUserId: connection.platformUserId,
      accessToken: connection.accessToken || null,
      refreshToken: connection.refreshToken || null,
      expiresAt: connection.expiresAt || null,
      isActive: connection.isActive || true,
      createdAt: now,
      updatedAt: now,
    };
    
    const userConnections = this.socialConnections.get(connection.userId) || [];
    userConnections.push(created);
    this.socialConnections.set(connection.userId, userConnections);
    return created;
  }

  async getSocialConnections(userId: string): Promise<SocialConnection[]> {
    return this.socialConnections.get(userId) || [];
  }

  async updateSocialConnection(id: string, connection: Partial<InsertSocialConnection>): Promise<SocialConnection> {
    for (const [userId, userConnections] of this.socialConnections.entries()) {
      const socialConnection = userConnections.find(c => c.id === id);
      if (socialConnection) {
        Object.assign(socialConnection, connection, { updatedAt: new Date() });
        return socialConnection;
      }
    }
    throw new Error('Social connection not found');
  }
}

export const storage = new MemoryStorage();
