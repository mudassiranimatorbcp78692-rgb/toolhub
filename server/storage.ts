// Storage interface for Office Tools Hub
// Since all tools process files client-side, we don't need database storage
// This file is kept for future extensibility (e.g., user accounts, saved projects)

export interface IStorage {
  // Placeholder for future storage needs
  health(): Promise<{ status: string }>;
}

export class MemStorage implements IStorage {
  constructor() {
    // Initialize any in-memory storage if needed
  }

  async health(): Promise<{ status: string }> {
    return { status: "ok" };
  }
}

export const storage = new MemStorage();

// Stripe payment methods storage
export const paymentPlans = {
  pro: {
    id: 'pro',
    name: 'Pro',
    price: 200, // $2.00 in cents
    currency: 'usd',
    interval: 'month'
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    price: 500, // $5.00 in cents
    currency: 'usd',
    interval: 'month'
  }
};
