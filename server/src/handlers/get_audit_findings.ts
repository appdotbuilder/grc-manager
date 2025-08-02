
import { db } from '../db';
import { auditFindingsTable } from '../db/schema';
import { type AuditFinding } from '../schema';

export const getAuditFindings = async (): Promise<AuditFinding[]> => {
  try {
    const results = await db.select()
      .from(auditFindingsTable)
      .execute();

    return results;
  } catch (error) {
    console.error('Failed to fetch audit findings:', error);
    throw error;
  }
};
