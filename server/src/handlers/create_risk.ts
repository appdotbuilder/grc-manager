
import { db } from '../db';
import { risksTable } from '../db/schema';
import { type CreateRiskInput, type Risk } from '../schema';

export const createRisk = async (input: CreateRiskInput): Promise<Risk> => {
  try {
    const result = await db.insert(risksTable)
      .values({
        name: input.name,
        description: input.description,
        risk_level: input.risk_level,
        likelihood: input.likelihood,
        impact: input.impact,
        control_id: input.control_id,
        owner: input.owner,
        mitigation_strategy: input.mitigation_strategy
      })
      .returning()
      .execute();

    return result[0];
  } catch (error) {
    console.error('Risk creation failed:', error);
    throw error;
  }
};
