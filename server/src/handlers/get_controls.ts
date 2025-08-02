
import { db } from '../db';
import { controlsTable } from '../db/schema';
import { type Control } from '../schema';

export const getControls = async (): Promise<Control[]> => {
  try {
    const result = await db.select()
      .from(controlsTable)
      .execute();

    return result;
  } catch (error) {
    console.error('Failed to fetch controls:', error);
    throw error;
  }
};
