import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

function getDatabaseUrl(): string {
  // If an external or remote database URL is configured, use it directly
  const customUrl = process.env.DATABASE_URL;
  if (customUrl && !customUrl.includes('dev.db')) {
    return customUrl;
  }

  // When running inside Vercel's serverless environment, the lambda filesystem is read-only
  // except for /tmp. We copy the pre-seeded SQLite database to /tmp so writes and connections succeed.
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    const tmpDbPath = '/tmp/dev.db';
    try {
      if (!fs.existsSync(tmpDbPath)) {
        const potentialSources = [
          path.join(process.cwd(), 'prisma', 'dev.db'),
          path.join(process.cwd(), 'frontend', 'prisma', 'dev.db'),
          path.resolve(__dirname, '..', '..', 'prisma', 'dev.db'),
        ];
        for (const src of potentialSources) {
          if (fs.existsSync(/*turbopackIgnore: true*/ src)) {
            fs.copyFileSync(/*turbopackIgnore: true*/ src, tmpDbPath);
            break;
          }
        }
      }
      return `file:${tmpDbPath}`;
    } catch (err) {
      console.warn('[Prisma Vercel /tmp Warning]', err);
    }
  }

  return customUrl || 'file:./dev.db';
}

const activeDbUrl = getDatabaseUrl();
process.env.DATABASE_URL = activeDbUrl;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: activeDbUrl,
      },
    },
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
