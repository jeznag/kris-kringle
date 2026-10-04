export interface Account {
  id: number;
  account_name: string | null;
  account_id: string;
}

export interface FamilyMember {
  id: number;
  name: string | null;
  partner: string | null;
  family_member_type: string | null;
  parent_id: string | null;
  participating_this_year: string | null;
}

export type FamilyMemberFields = Omit<FamilyMember, 'id'>;

export interface GiftExchange {
  id: number;
  giver_name: string | null;
  receiver_name: string | null;
  social_distance: string | null;
  giver_type: string | null;
  receiver_type: string | null;
  xmas_year: string;
  giver_id: number | null;
  receiver_id: number | null;
}

export type GiftExchangeFields = Omit<GiftExchange, 'id' | 'xmas_year'>;

const FAMILY_MEMBER_COLUMNS = 'id, name, partner, family_member_type, parent_id, participating_this_year';
const GIFT_EXCHANGE_COLUMNS =
  'id, giver_name, receiver_name, social_distance, giver_type, receiver_type, xmas_year, giver_id, receiver_id';

export function findAccount(db: D1Database, accountId: string): Promise<Account | null> {
  return db
    .prepare('SELECT id, account_name, account_id FROM accounts WHERE account_id = ?')
    .bind(accountId)
    .first<Account>();
}

export async function createAccount(db: D1Database, accountName: string, accountId: string): Promise<void> {
  await db.prepare('INSERT INTO accounts (account_name, account_id) VALUES (?, ?)').bind(accountName, accountId).run();
}

export async function listFamilyMembers(db: D1Database, accountId: string): Promise<FamilyMember[]> {
  const { results } = await db
    .prepare(`SELECT ${FAMILY_MEMBER_COLUMNS} FROM family_members WHERE account_id = ? ORDER BY id`)
    .bind(accountId)
    .all<FamilyMember>();
  return results;
}

export function createFamilyMember(
  db: D1Database,
  accountId: string,
  fields: FamilyMemberFields,
): Promise<FamilyMember | null> {
  return db
    .prepare(
      `INSERT INTO family_members (account_id, name, partner, family_member_type, parent_id, participating_this_year)
       VALUES (?, ?, ?, ?, ?, ?) RETURNING ${FAMILY_MEMBER_COLUMNS}`,
    )
    .bind(
      accountId,
      fields.name,
      fields.partner,
      fields.family_member_type,
      fields.parent_id,
      fields.participating_this_year,
    )
    .first<FamilyMember>();
}

export function updateFamilyMember(
  db: D1Database,
  accountId: string,
  id: number,
  fields: FamilyMemberFields,
): Promise<FamilyMember | null> {
  return db
    .prepare(
      `UPDATE family_members
       SET name = ?, partner = ?, family_member_type = ?, parent_id = ?, participating_this_year = ?,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ? AND account_id = ? RETURNING ${FAMILY_MEMBER_COLUMNS}`,
    )
    .bind(
      fields.name,
      fields.partner,
      fields.family_member_type,
      fields.parent_id,
      fields.participating_this_year,
      id,
      accountId,
    )
    .first<FamilyMember>();
}

export async function deleteFamilyMember(db: D1Database, accountId: string, id: number): Promise<boolean> {
  const { meta } = await db
    .prepare('DELETE FROM family_members WHERE id = ? AND account_id = ?')
    .bind(id, accountId)
    .run();
  return meta.changes > 0;
}

export async function listGiftExchanges(db: D1Database, accountId: string): Promise<GiftExchange[]> {
  const { results } = await db
    .prepare(`SELECT ${GIFT_EXCHANGE_COLUMNS} FROM gift_exchanges WHERE account_id = ? ORDER BY xmas_year, id`)
    .bind(accountId)
    .all<GiftExchange>();
  return results;
}

/** Replaces every exchange for the given year in one atomic batch. */
export async function replaceGiftExchangesForYear(
  db: D1Database,
  accountId: string,
  xmasYear: string,
  exchanges: GiftExchangeFields[],
): Promise<void> {
  const deleteExisting = db
    .prepare('DELETE FROM gift_exchanges WHERE account_id = ? AND xmas_year = ?')
    .bind(accountId, xmasYear);
  const insert = db.prepare(
    `INSERT INTO gift_exchanges
       (account_id, xmas_year, giver_name, receiver_name, giver_type, receiver_type, social_distance, giver_id, receiver_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  );
  const inserts = exchanges.map((exchange) =>
    insert.bind(
      accountId,
      xmasYear,
      exchange.giver_name,
      exchange.receiver_name,
      exchange.giver_type,
      exchange.receiver_type,
      exchange.social_distance,
      exchange.giver_id,
      exchange.receiver_id,
    ),
  );
  await db.batch([deleteExisting, ...inserts]);
}
