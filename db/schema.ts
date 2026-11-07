import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
export const profiles = sqliteTable("profiles", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  age: integer("age").notNull(),
  gender: text("gender").notNull(),
  language: text("language").notNull().default("en"),
  contactType: text("contact_type").notNull(),
  contact: text("contact").notNull(),
  passport: text("passport"),
  createdAt: text("created_at").notNull(),
});
export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  date: text("date").notNull(),
  game: integer("game").notNull(),
  accuracy: integer("accuracy").notNull(),
  speed: integer("speed").notNull(),
  level: integer("level").notNull(),
});
export const calibrations = sqliteTable("calibrations", {
  userId: text("user_id").primaryKey(),
  levels: text("levels").notNull(),
  stages: text("stages").notNull(),
  completedAt: text("completed_at").notNull(),
});
export const staffCredentials = sqliteTable("staff_credentials", {
  userId: text("user_id").primaryKey(),
  username: text("username").notNull().unique(),
  salt: text("salt").notNull(),
  passwordHash: text("password_hash").notNull(),
  attempts: integer("attempts").notNull().default(0),
  windowStart: integer("window_start").notNull().default(0),
  sessionHash: text("session_hash"),
  expiresAt: integer("expires_at"),
});
