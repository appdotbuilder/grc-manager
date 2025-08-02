
import { db } from '../db';
import { vulnerabilitiesTable } from '../db/schema';
import { type Vulnerability } from '../schema';

export const getVulnerabilities = async (): Promise<Vulnerability[]> => {
  try {
    const results = await db.select()
      .from(vulnerabilitiesTable)
      .execute();

    // Convert numeric fields back to numbers
    return results.map(vulnerability => ({
      ...vulnerability,
      // No numeric fields to convert in vulnerabilities table
    }));
  } catch (error) {
    console.error('Get vulnerabilities failed:', error);
    throw error;
  }
};
