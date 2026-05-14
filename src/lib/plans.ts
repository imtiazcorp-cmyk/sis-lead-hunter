import { Plan } from "@prisma/client";

export const PLAN_LIMITS: Record<Plan, { searches: number; mails: number; users: number }> = {
  STARTER: { searches: 500, mails: 100, users: 1 },
  PRO:     { searches: 5000, mails: -1, users: 3 },   // -1 = illimité
  AGENCY:  { searches: -1, mails: -1, users: -1 },
};

export const PLAN_PRICES = {
  STARTER: { monthly: 4900, annual: 3920, priceId: process.env.STRIPE_STARTER_PRICE_ID! },
  PRO:     { monthly: 14900, annual: 11920, priceId: process.env.STRIPE_PRO_PRICE_ID! },
  AGENCY:  { monthly: 39900, annual: 31920, priceId: process.env.STRIPE_AGENCY_PRICE_ID! },
};

export function canSearch(plan: Plan, used: number): boolean {
  const limit = PLAN_LIMITS[plan].searches;
  return limit === -1 || used < limit;
}

export function canGenerateMail(plan: Plan, used: number): boolean {
  const limit = PLAN_LIMITS[plan].mails;
  return limit === -1 || used < limit;
}

export function remainingSearches(plan: Plan, used: number): number {
  const limit = PLAN_LIMITS[plan].searches;
  return limit === -1 ? Infinity : Math.max(0, limit - used);
}
