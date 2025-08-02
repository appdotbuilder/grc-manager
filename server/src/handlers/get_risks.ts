
import { db } from '../db';
import { risksTable } from '../db/schema';
import { type Risk } from '../schema';

export const getRisks = async (): Promise<Risk[]> => {
  try {
    const results = await db.select()
      .from(risksTable)
      .execute();

    // No numeric columns to convert in risks table
    return results;
  } catch (error) {
    console.error('Failed to fetch risks:', error);
    throw error;
  }
};
