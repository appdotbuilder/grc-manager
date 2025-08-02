
import { db } from '../db';
import { controlsTable } from '../db/schema';
import { type CreateControlInput, type Control } from '../schema';

export const createControl = async (input: CreateControlInput): Promise<Control> => {
  try {
    // Insert control record
    const result = await db.insert(controlsTable)
      .values({
        name: input.name,
        description: input.description,
        control_type: input.control_type,
        status: input.status,
        policy_id: input.policy_id,
        owner: input.owner,
        implementation_date: input.implementation_date,
        last_audit_date: input.last_audit_date
      })
      .returning()
      .execute();

    return result[0];
  } catch (error) {
    console.error('Control creation failed:', error);
    throw error;
  }
};
