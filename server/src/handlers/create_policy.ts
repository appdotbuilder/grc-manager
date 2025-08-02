
import { db } from '../db';
import { policiesTable } from '../db/schema';
import { type CreatePolicyInput, type Policy } from '../schema';

export const createPolicy = async (input: CreatePolicyInput): Promise<Policy> => {
  try {
    // Insert policy record
    const result = await db.insert(policiesTable)
      .values({
        title: input.title,
        description: input.description,
        version: input.version,
        effective_date: input.effective_date,
        review_date: input.review_date,
        owner: input.owner
      })
      .returning()
      .execute();

    // Return the created policy
    const policy = result[0];
    return policy;
  } catch (error) {
    console.error('Policy creation failed:', error);
    throw error;
  }
};
