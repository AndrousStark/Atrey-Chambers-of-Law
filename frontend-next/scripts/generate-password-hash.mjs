#!/usr/bin/env node
/**
 * Utility to generate a PBKDF2 password hash for the ADMIN_PASSWORD_HASH env variable.
 *
 * Usage:
 *   node scripts/generate-password-hash.mjs "your-secure-password"
 *
 * Then set the output as ADMIN_PASSWORD_HASH in your .env.local or Vercel environment variables.
 */

import crypto from 'crypto';

const password = process.argv[2];

if (!password) {
  console.error('Usage: node scripts/generate-password-hash.mjs "your-password"');
  console.error('');
  console.error('The output should be set as ADMIN_PASSWORD_HASH in your environment.');
  process.exit(1);
}

const salt = crypto.randomBytes(16).toString('hex');
const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
const result = `${salt}:${hash}`;

console.log('');
console.log('Password hash generated successfully.');
console.log('');
console.log('Add these to your .env.local or Vercel environment variables:');
console.log('');
console.log(`ADMIN_PASSWORD_HASH=${result}`);
console.log('');
console.log('Also ensure these are set:');
console.log('  ADMIN_EMAILS=admin1@example.com,admin2@example.com');
console.log('  SESSION_SECRET=' + crypto.randomBytes(32).toString('hex'));
console.log('');
