import { prisma } from './prisma';

/**
 * Real registered members are fetched and persisted directly in the live database.
 * Automatic mock seeding is disabled to ensure only real registered students and professionals
 * appear across the member directory, community feed, and network graph.
 */
export async function ensureDatabaseSeeded() {
  return;
}
