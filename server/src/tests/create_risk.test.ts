
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { risksTable, controlsTable, policiesTable } from '../db/schema';
import { type CreateRiskInput } from '../schema';
import { createRisk } from '../handlers/create_risk';
import { eq } from 'drizzle-orm';

// Simple test input
const testInput: CreateRiskInput = {
  name: 'Data Breach Risk',
  description: 'Risk of unauthorized access to sensitive data',
  risk_level: 'high',
  likelihood: 4,
  impact: 5,
  control_id: null,
  owner: 'John Doe',
  mitigation_strategy: 'Implement additional security controls'
};

describe('createRisk', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a risk', async () => {
    const result = await createRisk(testInput);

    // Basic field validation
    expect(result.name).toEqual('Data Breach Risk');
    expect(result.description).toEqual(testInput.description);
    expect(result.risk_level).toEqual('high');
    expect(result.likelihood).toEqual(4);
    expect(result.impact).toEqual(5);
    expect(result.control_id).toBeNull();
    expect(result.owner).toEqual('John Doe');
    expect(result.mitigation_strategy).toEqual(testInput.mitigation_strategy);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save risk to database', async () => {
    const result = await createRisk(testInput);

    const risks = await db.select()
      .from(risksTable)
      .where(eq(risksTable.id, result.id))
      .execute();

    expect(risks).toHaveLength(1);
    expect(risks[0].name).toEqual('Data Breach Risk');
    expect(risks[0].description).toEqual(testInput.description);
    expect(risks[0].risk_level).toEqual('high');
    expect(risks[0].likelihood).toEqual(4);
    expect(risks[0].impact).toEqual(5);
    expect(risks[0].owner).toEqual('John Doe');
    expect(risks[0].created_at).toBeInstanceOf(Date);
    expect(risks[0].updated_at).toBeInstanceOf(Date);
  });

  it('should create risk with valid control reference', async () => {
    // Create a policy first
    const policy = await db.insert(policiesTable)
      .values({
        title: 'Security Policy',
        version: '1.0',
        effective_date: new Date(),
        owner: 'Security Team'
      })
      .returning()
      .execute();

    // Create a control to reference
    const control = await db.insert(controlsTable)
      .values({
        name: 'Access Control',
        control_type: 'Technical',
        status: 'implemented',
        policy_id: policy[0].id,
        owner: 'IT Team'
      })
      .returning()
      .execute();

    const inputWithControl: CreateRiskInput = {
      ...testInput,
      control_id: control[0].id
    };

    const result = await createRisk(inputWithControl);

    expect(result.control_id).toEqual(control[0].id);

    // Verify in database
    const risks = await db.select()
      .from(risksTable)
      .where(eq(risksTable.id, result.id))
      .execute();

    expect(risks[0].control_id).toEqual(control[0].id);
  });

  it('should handle risk with minimal required fields', async () => {
    const minimalInput: CreateRiskInput = {
      name: 'Minimal Risk',
      description: null,
      risk_level: 'low',
      likelihood: 1,
      impact: 1,
      control_id: null,
      owner: 'Risk Manager',
      mitigation_strategy: null
    };

    const result = await createRisk(minimalInput);

    expect(result.name).toEqual('Minimal Risk');
    expect(result.description).toBeNull();
    expect(result.risk_level).toEqual('low');
    expect(result.likelihood).toEqual(1);
    expect(result.impact).toEqual(1);
    expect(result.control_id).toBeNull();
    expect(result.owner).toEqual('Risk Manager');
    expect(result.mitigation_strategy).toBeNull();
  });
});
