export type Market = "portugal" | "spain";
export type UserRole = "admin" | "creator_portugal" | "creator_spain";

export const ROLE_MARKET_MAP: Record<UserRole, Market | null> = {
  admin: null,
  creator_portugal: "portugal",
  creator_spain: "spain",
};

export function getMarketFromRole(role: UserRole): Market | null {
  return ROLE_MARKET_MAP[role] ?? null;
}

export function canAccessMarket(role: UserRole, targetMarket: Market): boolean {
  const userMarket = getMarketFromRole(role);
  return userMarket === null || userMarket === targetMarket;
}
