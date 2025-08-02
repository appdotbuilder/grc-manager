
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { policiesTable } from '../db/schema';
import { type CreatePolicyInput } from '../schema';
import { getPolicies } from '../handlers/get_policies';

// Test policy data
const testPolicy1: CreatePolicyInput = {
  title: 'Data Protection Policy',
  description: 'Policy for protecting sensitive data',
  version: '1.0',
  effective_date: new Date('2024-01-01'),
  review_date: new Date('2024-12-31'),
  owner: 'Security Team'
};

const testPolicy2: CreatePolicyInput = {
  title: 'Access Control Policy',
  description: 'Policy for managing user access',
  version: '2.1',
  effective_date: new Date('2024-02-01'),
  review_date: null,
  owner: 'IT Department'
};

describe('getPolicies', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no policies exist', async () => {
    const result = await getPolicies();

    expect(result).toEqual([]);
  });

  it('should return all policies', async () => {
    // Create test policies
    await db.insert(policiesTable)
      .values([testPolicy1, testPolicy2])
      .execute();

    const result = await getPolicies();

    expect(result).toHaveLength(2);
    
    // Check first policy
    const policy1 = result.find(p => p.title === 'Data Protection Policy');
    expect(policy1).toBeDefined();
    expect(policy1!.description).toEqual('Policy for protecting sensitive data');
    expect(policy1!.version).toEqual('1.0');
    expect(policy1!.owner).toEqual('Security Team');
    expect(policy1!.effective_date).toBeInstanceOf(Date);
    expect(policy1!.review_date).toBeInstanceOf(Date);
    expect(policy1!.id).toBeDefined();
    expect(policy1!.created_at).toBeInstanceOf(Date);
    expect(policy1!.updated_at).toBeInstanceOf(Date);

    // Check second policy
    const policy2 = result.find(p => p.title === 'Access Control Policy');
    expect(policy2).toBeDefined();
    expect(policy2!.description).toEqual('Policy for managing user access');
    expect(policy2!.version).toEqual('2.1');
    expect(policy2!.owner).toEqual('IT Department');
    expect(policy2!.effective_date).toBeInstanceOf(Date);
    expect(policy2!.review_date).toBeNull();
    expect(policy2!.id).toBeDefined();
    expect(policy2!.created_at).toBeInstanceOf(Date);
    expect(policy2!.updated_at).toBeInstanceOf(Date);
  });

  it('should return policies with correct data types', async () => {
    await db.insert(policiesTable)
      .values(testPolicy1)
      .execute();

    const result = await getPolicies();

    expect(result).toHaveLength(1);
    const policy = result[0];
    
    expect(typeof policy.id).toBe('number');
    expect(typeof policy.title).toBe('string');
    expect(typeof policy.version).toBe('string');
    expect(typeof policy.owner).toBe('string');
    expect(policy.effective_date).toBeInstanceOf(Date);
    expect(policy.created_at).toBeInstanceOf(Date);
    expect(policy.updated_at).toBeInstanceOf(Date);
  });
});
