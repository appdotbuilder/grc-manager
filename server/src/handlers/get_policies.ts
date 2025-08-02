
import { db } from '../db';
import { policiesTable } from '../db/schema';
import { type Policy } from '../schema';

export const getPolicies = async (): Promise<Policy[]> => {
  try {
    const results = await db.select()
      .from(policiesTable)
      .execute();

    return results;
  } catch (error) {
    console.error('Failed to fetch policies:', error);
    throw error;
  }
};
