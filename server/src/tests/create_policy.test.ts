
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { policiesTable } from '../db/schema';
import { type CreatePolicyInput } from '../schema';
import { createPolicy } from '../handlers/create_policy';
import { eq } from 'drizzle-orm';

// Test input with all required fields
const testInput: CreatePolicyInput = {
  title: 'Data Protection Policy',
  description: 'Policy governing data protection and privacy measures',
  version: '1.0.0',
  effective_date: new Date('2024-01-01'),
  review_date: new Date('2024-12-31'),
  owner: 'Chief Security Officer'
};

describe('createPolicy', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a policy', async () => {
    const result = await createPolicy(testInput);

    // Basic field validation
    expect(result.title).toEqual('Data Protection Policy');
    expect(result.description).toEqual(testInput.description);
    expect(result.version).toEqual('1.0.0');
    expect(result.effective_date).toEqual(testInput.effective_date);
    expect(result.review_date).toEqual(testInput.review_date);
    expect(result.owner).toEqual('Chief Security Officer');
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save policy to database', async () => {
    const result = await createPolicy(testInput);

    // Query using proper drizzle syntax
    const policies = await db.select()
      .from(policiesTable)
      .where(eq(policiesTable.id, result.id))
      .execute();

    expect(policies).toHaveLength(1);
    expect(policies[0].title).toEqual('Data Protection Policy');
    expect(policies[0].description).toEqual(testInput.description);
    expect(policies[0].version).toEqual('1.0.0');
    expect(policies[0].owner).toEqual('Chief Security Officer');
    expect(policies[0].created_at).toBeInstanceOf(Date);
    expect(policies[0].updated_at).toBeInstanceOf(Date);
  });

  it('should handle policy with null description and review_date', async () => {
    const inputWithNulls: CreatePolicyInput = {
      title: 'Minimal Policy',
      description: null,
      version: '1.0',
      effective_date: new Date('2024-01-01'),
      review_date: null,
      owner: 'Policy Owner'
    };

    const result = await createPolicy(inputWithNulls);

    expect(result.title).toEqual('Minimal Policy');
    expect(result.description).toBeNull();
    expect(result.review_date).toBeNull();
    expect(result.version).toEqual('1.0');
    expect(result.owner).toEqual('Policy Owner');
  });

  it('should handle date objects correctly', async () => {
    const effectiveDate = new Date('2024-06-15T10:00:00.000Z');
    const reviewDate = new Date('2025-06-15T10:00:00.000Z');

    const inputWithDates: CreatePolicyInput = {
      title: 'Date Test Policy',
      description: 'Testing date handling',
      version: '2.0',
      effective_date: effectiveDate,
      review_date: reviewDate,
      owner: 'Date Tester'
    };

    const result = await createPolicy(inputWithDates);

    expect(result.effective_date).toEqual(effectiveDate);
    expect(result.review_date).toEqual(reviewDate);
    expect(result.effective_date).toBeInstanceOf(Date);
    expect(result.review_date).toBeInstanceOf(Date);
  });
});
