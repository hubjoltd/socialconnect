import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  boolean,
  uuid,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Meetings table
export const meetings = pgTable("meetings", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title").notNull(),
  description: text("description"),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  timezone: varchar("timezone").notNull().default("UTC"),
  meetingType: varchar("meeting_type").notNull().default("scheduled"), // scheduled, instant, recurring
  joinLink: varchar("join_link"),
  hostId: varchar("host_id").notNull(),
  maxParticipants: varchar("max_participants").default("100"),
  waitingRoom: boolean("waiting_room").default(true),
  requirePassword: boolean("require_password").default(false),
  password: varchar("password"),
  recordMeeting: boolean("record_meeting").default(false),
  muteOnEntry: boolean("mute_on_entry").default(true),
  hostVideo: boolean("host_video").default(true),
  participantVideo: boolean("participant_video").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Meeting participants table
export const meetingParticipants = pgTable("meeting_participants", {
  id: uuid("id").primaryKey().defaultRandom(),
  meetingId: uuid("meeting_id").notNull(),
  email: varchar("email").notNull(),
  name: varchar("name"),
  role: varchar("role").notNull().default("participant"), // host, co-host, participant
  inviteStatus: varchar("invite_status").notNull().default("pending"), // pending, accepted, declined
  joinedAt: timestamp("joined_at"),
  leftAt: timestamp("left_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Contacts table
export const contacts = pgTable("contacts", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: varchar("user_id").notNull(),
  contactUserId: varchar("contact_user_id"),
  email: varchar("email").notNull(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  status: varchar("status").notNull().default("pending"), // pending, accepted, blocked
  inviteMessage: text("invite_message"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Team chat channels table
export const chatChannels = pgTable("chat_channels", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name").notNull(),
  description: text("description"),
  channelType: varchar("channel_type").notNull().default("public"), // public, private, direct
  createdBy: varchar("created_by").notNull(),
  members: text("members").array(), // Array of user IDs
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Chat messages table
export const chatMessages = pgTable("chat_messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  channelId: uuid("channel_id").notNull(),
  userId: varchar("user_id").notNull(),
  content: text("content").notNull(),
  messageType: varchar("message_type").notNull().default("text"), // text, file, image, system
  attachments: jsonb("attachments"), // JSON array of file info
  replyToId: uuid("reply_to_id"), // For threaded messages
  editedAt: timestamp("edited_at"),
  deletedAt: timestamp("deleted_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Calendar events table
export const calendarEvents = pgTable("calendar_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: varchar("user_id").notNull(),
  title: varchar("title").notNull(),
  description: text("description"),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  timezone: varchar("timezone").notNull().default("UTC"),
  isAllDay: boolean("is_all_day").default(false),
  location: varchar("location"),
  eventType: varchar("event_type").notNull().default("meeting"), // meeting, appointment, reminder
  googleEventId: varchar("google_event_id"), // For Google Calendar sync
  outlookEventId: varchar("outlook_event_id"), // For Outlook sync
  recurrence: jsonb("recurrence"), // Recurrence rules
  attendees: text("attendees").array(), // Array of email addresses
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Create insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  firstName: true,
  lastName: true,
  profileImageUrl: true,
});

export const insertMeetingSchema = createInsertSchema(meetings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMeetingParticipantSchema = createInsertSchema(meetingParticipants).omit({
  id: true,
  createdAt: true,
});

export const insertContactSchema = createInsertSchema(contacts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertChatChannelSchema = createInsertSchema(chatChannels).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  createdAt: true,
});

export const insertCalendarEventSchema = createInsertSchema(calendarEvents).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Export types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Meeting = typeof meetings.$inferSelect;
export type InsertMeeting = z.infer<typeof insertMeetingSchema>;

export type MeetingParticipant = typeof meetingParticipants.$inferSelect;
export type InsertMeetingParticipant = z.infer<typeof insertMeetingParticipantSchema>;

export type Contact = typeof contacts.$inferSelect;
export type InsertContact = z.infer<typeof insertContactSchema>;

export type ChatChannel = typeof chatChannels.$inferSelect;
export type InsertChatChannel = z.infer<typeof insertChatChannelSchema>;

export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;

export type CalendarEvent = typeof calendarEvents.$inferSelect;
export type InsertCalendarEvent = z.infer<typeof insertCalendarEventSchema>;
