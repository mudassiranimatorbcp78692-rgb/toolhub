import { z } from "zod";
import { pgTable, text, integer, timestamp, serial, varchar, boolean } from 'drizzle-orm/pg-core';

// Database table for reviews
export const reviewsTable = pgTable('reviews', {
  id: serial('id').primaryKey(),
  toolName: text('tool_name').notNull(),
  rating: integer('rating').notNull(),
  comment: text('comment').notNull(),
  userName: text('user_name').notNull(),
  userEmail: text('user_email'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Database table for orders/subscriptions
export const ordersTable = pgTable('orders', {
  id: serial('id').primaryKey(),
  planName: varchar('plan_name').notNull(),
  price: text('price').notNull(),
  customerEmail: text('customer_email').notNull(),
  customerName: text('customer_name'),
  paymentMethod: varchar('payment_method').notNull(),
  status: varchar('status').default('pending').notNull(), // pending, pending_manual, completed, failed
  checkoutSessionId: text('checkout_session_id'),
  referenceId: text('reference_id'), // Invoice ID or 2Checkout ref
  invoiceId: text('invoice_id'),
  expiresAt: timestamp('expires_at'), // Subscription expiry
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Database table for active subscriptions
export const subscriptionsTable = pgTable('subscriptions', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  planName: varchar('plan_name').notNull(), // Pro, Enterprise, Free
  invoiceId: text('invoice_id'), // Link to order
  activatedAt: timestamp('activated_at').defaultNow().notNull(),
  expiresAt: timestamp('expires_at'), // Subscription expiry date
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Template schema for downloadable templates
export const templateSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.enum(['resume', 'invoice', 'salary-slip', 'offer-letter', 'office-forms']),
  description: z.string(),
  thumbnailUrl: z.string(),
  downloadUrl: z.string(),
});

export type Template = z.infer<typeof templateSchema>;

// Tool category schema
export const toolCategorySchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  icon: z.string(),
  toolCount: z.number(),
  path: z.string(),
});

export type ToolCategory = z.infer<typeof toolCategorySchema>;

// Individual tool schema
export const toolSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  category: z.string(),
  path: z.string(),
  icon: z.string(),
  isPro: z.boolean().default(false),
});

export type Tool = z.infer<typeof toolSchema>;

// File processing schemas
export const fileProcessingSchema = z.object({
  fileName: z.string(),
  fileSize: z.number(),
  fileType: z.string(),
  processedAt: z.date().optional(),
});

export type FileProcessing = z.infer<typeof fileProcessingSchema>;

// Calculator input schemas
export const percentageCalculatorSchema = z.object({
  value: z.number(),
  percentage: z.number(),
  operation: z.enum(['find', 'increase', 'decrease']),
});

export const loanCalculatorSchema = z.object({
  principal: z.number().positive(),
  interestRate: z.number().min(0).max(100),
  termYears: z.number().positive(),
});

export const gpaCalculatorSchema = z.object({
  courses: z.array(z.object({
    credits: z.number().positive(),
    grade: z.number().min(0).max(4),
  })),
});

export const zakatCalculatorSchema = z.object({
  gold: z.number().min(0),
  silver: z.number().min(0),
  cash: z.number().min(0),
  investments: z.number().min(0),
});

export type PercentageCalculator = z.infer<typeof percentageCalculatorSchema>;
export type LoanCalculator = z.infer<typeof loanCalculatorSchema>;
export type GpaCalculator = z.infer<typeof gpaCalculatorSchema>;
export type ZakatCalculator = z.infer<typeof zakatCalculatorSchema>;

// Reviews schema
export const reviewSchema = z.object({
  id: z.string().optional(),
  toolName: z.string(),
  rating: z.number().min(1).max(5),
  comment: z.string().min(1).max(500),
  userName: z.string().min(1).max(100),
  userEmail: z.string().email().optional(),
  createdAt: z.date().optional(),
});

export type Review = z.infer<typeof reviewSchema>;
