import type { FamilyMemberFields, GiftExchangeFields } from './db';

type JsonObject = Record<string, unknown>;

export class InvalidRequestError extends Error {}

function isJsonObject(value: unknown): value is JsonObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

// The client sends a mix of strings, numbers and booleans (e.g. participating_this_year
// arrives as `true`); the legacy schema stored them all as text.
function toNullableString(value: unknown): string | null {
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return null;
}

function toNullableInteger(value: unknown): number | null {
  const parsed = typeof value === 'string' ? Number(value) : value;
  return typeof parsed === 'number' && Number.isInteger(parsed) ? parsed : null;
}

function requireObject(value: unknown, description: string): JsonObject {
  if (!isJsonObject(value)) throw new InvalidRequestError(`Expected ${description} to be an object`);
  return value;
}

export function parseFamilyMemberBody(body: unknown): FamilyMemberFields {
  const familyMember = requireObject(requireObject(body, 'body').family_member, 'family_member');
  return {
    name: toNullableString(familyMember.name),
    partner: toNullableString(familyMember.partner),
    family_member_type: toNullableString(familyMember.family_member_type),
    parent_id: toNullableString(familyMember.parent_id),
    participating_this_year: toNullableString(familyMember.participating_this_year),
  };
}

function parseGiftExchange(wrapper: unknown): GiftExchangeFields {
  const exchange = requireObject(requireObject(wrapper, 'gift_exchanges entry').gift_exchange, 'gift_exchange');
  return {
    giver_name: toNullableString(exchange.giver_name),
    receiver_name: toNullableString(exchange.receiver_name),
    giver_type: toNullableString(exchange.giver_type),
    receiver_type: toNullableString(exchange.receiver_type),
    social_distance: toNullableString(exchange.social_distance),
    giver_id: toNullableInteger(exchange.giver_id),
    receiver_id: toNullableInteger(exchange.receiver_id),
  };
}

export function parseGiftExchangesBody(body: unknown): { xmasYear: string; exchanges: GiftExchangeFields[] } {
  const payload = requireObject(body, 'body');
  const xmasYear = toNullableString(payload.xmas_year);
  if (!xmasYear) throw new InvalidRequestError('xmas_year is required');
  if (!Array.isArray(payload.gift_exchanges)) throw new InvalidRequestError('gift_exchanges must be an array');
  return { xmasYear, exchanges: payload.gift_exchanges.map(parseGiftExchange) };
}
