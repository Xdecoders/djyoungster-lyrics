/**
 * Import emails from old database CSV into NewsletterSubscriber.
 *
 * Usage:
 *   node scripts/import-newsletter.js old_emails.csv
 *
 * CSV format expected (with or without header row):
 *   name,email
 *   Nitesh Jaiswal,nitesh200103jaiswal@gmail.com
 *   ...
 *
 * - Skips duplicates (upsert)
 * - Skips rows with invalid/empty email
 * - Sets status = "active", subscribedAt = now()
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

async function main() {
  const csvFile = process.argv[2];
  if (!csvFile) {
    console.error('Usage: node scripts/import-newsletter.js <path-to-csv>');
    process.exit(1);
  }

  const filePath = path.resolve(csvFile);
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    process.exit(1);
  }

  const raw = fs.readFileSync(filePath, 'utf-8');
  const lines = raw.split('\n').map(l => l.trim()).filter(Boolean);

  console.log(`Total lines in CSV: ${lines.length}`);

  let imported = 0;
  let skippedInvalid = 0;
  let skippedDuplicate = 0;
  let errors = 0;

  // Detect if first line is a header (contains "email" literally)
  let startIndex = 0;
  if (lines[0].toLowerCase().includes('email')) {
    console.log('Header row detected, skipping first line.');
    startIndex = 1;
  }

  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i];
    const parts = line.split(',');

    let name = '';
    let email = '';

    if (parts.length === 1) {
      // Only email column
      email = parts[0].replace(/"/g, '').trim();
    } else {
      // name,email columns
      name = parts[0].replace(/"/g, '').trim();
      email = parts[1].replace(/"/g, '').trim();
    }

    if (!email || !isValidEmail(email)) {
      skippedInvalid++;
      continue;
    }

    try {
      await prisma.newsletterSubscriber.upsert({
        where: { email: email.toLowerCase() },
        update: {}, // don't overwrite existing subscribers
        create: {
          email: email.toLowerCase(),
          name: name || null,
          status: 'active',
          subscribedAt: new Date(),
        },
      });
      imported++;

      if (imported % 100 === 0) {
        process.stdout.write(`\rImported: ${imported}...`);
      }
    } catch (err) {
      if (err.code === 'P2002') {
        // Unique constraint - already exists
        skippedDuplicate++;
      } else {
        console.error(`\nError on line ${i + 1} (${email}):`, err.message);
        errors++;
      }
    }
  }

  console.log('\n');
  console.log('=== Import Complete ===');
  console.log(`Imported (new):      ${imported}`);
  console.log(`Skipped (duplicate): ${skippedDuplicate}`);
  console.log(`Skipped (invalid):   ${skippedInvalid}`);
  console.log(`Errors:              ${errors}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
