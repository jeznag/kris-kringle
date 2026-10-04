#!/usr/bin/env node
/**
 * Prints an admin password hash for accounts created before admin passwords existed.
 * Reads the password from stdin so it never lands in shell history:
 *
 *   node --experimental-strip-types scripts/hash-admin-password.mjs
 *   npx wrangler d1 execute kris-kringle --remote \
 *     --command "UPDATE accounts SET admin_password_hash = '<hash>' WHERE account_id = '<account id>'"
 */
import { createInterface } from 'node:readline/promises';
import { hashPassword } from '../src/password.ts';

const readline = createInterface({ input: process.stdin, output: process.stderr });
const password = await readline.question('Admin password: ');
readline.close();
process.stdout.write(`${await hashPassword(password.trim())}\n`);
