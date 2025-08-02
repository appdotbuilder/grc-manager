
import { db } from '../db';
import { incidentsTable } from '../db/schema';
import { type CreateIncidentInput, type Incident } from '../schema';

export const createIncident = async (input: CreateIncidentInput): Promise<Incident> => {
  try {
    // Insert incident record
    const result = await db.insert(incidentsTable)
      .values({
        title: input.title,
        description: input.description,
        severity: input.severity,
        status: input.status,
        asset_id: input.asset_id,
        discovered_date: input.discovered_date,
        resolved_date: input.resolved_date,
        root_cause: input.root_cause,
        remediation_actions: input.remediation_actions,
        reporter: input.reporter,
        assigned_to: input.assigned_to
      })
      .returning()
      .execute();

    return result[0];
  } catch (error) {
    console.error('Incident creation failed:', error);
    throw error;
  }
};
