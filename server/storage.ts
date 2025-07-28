import {
  users,
  meetings,
  meetingParticipants,
  contacts,
  calendarEvents,
  chatChannels,
  channelMembers,
  chatMessages,
  socialConnections,
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
import { db } from "./db";
import { eq, and, desc, asc } from "drizzle-orm";

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

export class DatabaseStorage implements IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Meeting operations
  async createMeeting(meeting: InsertMeeting): Promise<Meeting> {
    const [created] = await db.insert(meetings).values(meeting).returning();
    return created;
  }

  async getMeeting(id: string): Promise<Meeting | undefined> {
    const [meeting] = await db.select().from(meetings).where(eq(meetings.id, id));
    return meeting;
  }

  async getMeetingsByUser(userId: string): Promise<Meeting[]> {
    return await db.select().from(meetings).where(eq(meetings.hostId, userId)).orderBy(desc(meetings.startTime));
  }

  async updateMeeting(id: string, meeting: Partial<InsertMeeting>): Promise<Meeting> {
    const [updated] = await db
      .update(meetings)
      .set({ ...meeting, updatedAt: new Date() })
      .where(eq(meetings.id, id))
      .returning();
    return updated;
  }

  async deleteMeeting(id: string): Promise<void> {
    await db.delete(meetings).where(eq(meetings.id, id));
  }

  // Meeting participant operations
  async addMeetingParticipant(participant: InsertMeetingParticipant): Promise<MeetingParticipant> {
    const [created] = await db.insert(meetingParticipants).values(participant).returning();
    return created;
  }

  async getMeetingParticipants(meetingId: string): Promise<MeetingParticipant[]> {
    return await db.select().from(meetingParticipants).where(eq(meetingParticipants.meetingId, meetingId));
  }

  async updateParticipantStatus(meetingId: string, email: string, status: string): Promise<void> {
    await db
      .update(meetingParticipants)
      .set({ inviteStatus: status })
      .where(and(eq(meetingParticipants.meetingId, meetingId), eq(meetingParticipants.email, email)));
  }

  // Contact operations
  async createContact(contact: InsertContact): Promise<Contact> {
    const [created] = await db.insert(contacts).values(contact).returning();
    return created;
  }

  async getContacts(userId: string): Promise<Contact[]> {
    return await db.select().from(contacts).where(eq(contacts.userId, userId)).orderBy(asc(contacts.name));
  }

  async updateContactStatus(contactId: string, status: string): Promise<Contact> {
    const [updated] = await db
      .update(contacts)
      .set({ status, updatedAt: new Date() })
      .where(eq(contacts.id, contactId))
      .returning();
    return updated;
  }

  async deleteContact(contactId: string): Promise<void> {
    await db.delete(contacts).where(eq(contacts.id, contactId));
  }

  // Calendar operations
  async createCalendarEvent(event: InsertCalendarEvent): Promise<CalendarEvent> {
    const [created] = await db.insert(calendarEvents).values(event).returning();
    return created;
  }

  async getCalendarEvents(userId: string, startDate?: Date, endDate?: Date): Promise<CalendarEvent[]> {
    let query = db.select().from(calendarEvents).where(eq(calendarEvents.userId, userId));
    
    if (startDate && endDate) {
      query = query.where(
        and(
          eq(calendarEvents.userId, userId),
          // Add date range filtering when needed
        )
      );
    }
    
    return await query.orderBy(asc(calendarEvents.startTime));
  }

  async updateCalendarEvent(id: string, event: Partial<InsertCalendarEvent>): Promise<CalendarEvent> {
    const [updated] = await db
      .update(calendarEvents)
      .set({ ...event, updatedAt: new Date() })
      .where(eq(calendarEvents.id, id))
      .returning();
    return updated;
  }

  async deleteCalendarEvent(id: string): Promise<void> {
    await db.delete(calendarEvents).where(eq(calendarEvents.id, id));
  }

  // Chat operations
  async createChatChannel(channel: InsertChatChannel): Promise<ChatChannel> {
    const [created] = await db.insert(chatChannels).values(channel).returning();
    return created;
  }

  async getChatChannels(userId: string): Promise<ChatChannel[]> {
    // This would typically involve a join with channel members table
    // For now, return channels created by user
    return await db.select().from(chatChannels).where(eq(chatChannels.createdBy, userId));
  }

  async getChatMessages(channelId: string, limit: number = 50): Promise<ChatMessage[]> {
    return await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.channelId, channelId))
      .orderBy(desc(chatMessages.createdAt))
      .limit(limit);
  }

  async sendChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const [created] = await db.insert(chatMessages).values(message).returning();
    return created;
  }

  // Social connections
  async createSocialConnection(connection: InsertSocialConnection): Promise<SocialConnection> {
    const [created] = await db.insert(socialConnections).values(connection).returning();
    return created;
  }

  async getSocialConnections(userId: string): Promise<SocialConnection[]> {
    return await db.select().from(socialConnections).where(eq(socialConnections.userId, userId));
  }

  async updateSocialConnection(id: string, connection: Partial<InsertSocialConnection>): Promise<SocialConnection> {
    const [updated] = await db
      .update(socialConnections)
      .set({ ...connection, updatedAt: new Date() })
      .where(eq(socialConnections.id, id))
      .returning();
    return updated;
  }
}

export const storage = new DatabaseStorage();
