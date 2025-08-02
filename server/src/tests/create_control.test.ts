
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { controlsTable, policiesTable } from '../db/schema';
import { type CreateControlInput } from '../schema';
import { createControl } from '../handlers/create_control';
import { eq } from 'drizzle-orm';

// Simple test input without foreign key
const testInput: CreateControlInput = {
  name: 'Test Control',
  description: 'A control for testing',
  control_type: 'preventive',
  status: 'draft',
  policy_id: null,
  owner: 'John Doe',
  implementation_date: null,
  last_audit_date: null
};

describe('createControl', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a control', async () => {
    const result = await createControl(testInput);

    // Basic field validation
    expect(result.name).toEqual('Test Control');
    expect(result.description).toEqual(testInput.description);
    expect(result.control_type).toEqual('preventive');
    expect(result.status).toEqual('draft');
    expect(result.policy_id).toBeNull();
    expect(result.owner).toEqual('John Doe');
    expect(result.implementation_date).toBeNull();
    expect(result.last_audit_date).toBeNull();
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save control to database', async () => {
    const result = await createControl(testInput);

    // Query using proper drizzle syntax
    const controls = await db.select()
      .from(controlsTable)
      .where(eq(controlsTable.id, result.id))
      .execute();

    expect(controls).toHaveLength(1);
    expect(controls[0].name).toEqual('Test Control');
    expect(controls[0].description).toEqual(testInput.description);
    expect(controls[0].control_type).toEqual('preventive');
    expect(controls[0].status).toEqual('draft');
    expect(controls[0].owner).toEqual('John Doe');
    expect(controls[0].created_at).toBeInstanceOf(Date);
    expect(controls[0].updated_at).toBeInstanceOf(Date);
  });

  it('should create a control with valid policy reference', async () => {
    // Create a policy first
    const policyResult = await db.insert(policiesTable)
      .values({
        title: 'Test Policy',
        description: 'A policy for testing',
        version: '1.0',
        effective_date: new Date(),
        review_date: null,
        owner: 'Policy Owner'
      })
      .returning()
      .execute();

    const policy = policyResult[0];

    // Create control with policy reference
    const controlInput: CreateControlInput = {
      ...testInput,
      policy_id: policy.id
    };

    const result = await createControl(controlInput);

    expect(result.policy_id).toEqual(policy.id);

    // Verify in database
    const controls = await db.select()
      .from(controlsTable)
      .where(eq(controlsTable.id, result.id))
      .execute();

    expect(controls[0].policy_id).toEqual(policy.id);
  });

  it('should create control with dates', async () => {
    const implementationDate = new Date('2024-01-15');
    const lastAuditDate = new Date('2024-02-01');

    const controlInput: CreateControlInput = {
      ...testInput,
      implementation_date: implementationDate,
      last_audit_date: lastAuditDate
    };

    const result = await createControl(controlInput);

    expect(result.implementation_date).toEqual(implementationDate);
    expect(result.last_audit_date).toEqual(lastAuditDate);

    // Verify dates in database
    const controls = await db.select()
      .from(controlsTable)
      .where(eq(controlsTable.id, result.id))
      .execute();

    expect(controls[0].implementation_date).toEqual(implementationDate);
    expect(controls[0].last_audit_date).toEqual(lastAuditDate);
  });
});
