
import { db } from '../db';
import { incidentsTable } from '../db/schema';
import { type Incident } from '../schema';

export const getIncidents = async (): Promise<Incident[]> => {
  try {
    const results = await db.select()
      .from(incidentsTable)
      .execute();

    return results.map(incident => ({
      ...incident,
      // No numeric conversions needed - all fields are text, enum, integer, or timestamp
    }));
  } catch (error) {
    console.error('Failed to fetch incidents:', error);
    throw error;
  }
};
