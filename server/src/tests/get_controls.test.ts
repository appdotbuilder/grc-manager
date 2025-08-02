
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { controlsTable, policiesTable } from '../db/schema';
import { type CreateControlInput } from '../schema';
import { getControls } from '../handlers/get_controls';

describe('getControls', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no controls exist', async () => {
    const result = await getControls();
    expect(result).toEqual([]);
  });

  it('should return all controls', async () => {
    // Create a policy first (for foreign key constraint)
    const policyResult = await db.insert(policiesTable)
      .values({
        title: 'Test Policy',
        version: '1.0',
        effective_date: new Date(),
        owner: 'Test Owner'
      })
      .returning()
      .execute();

    const policyId = policyResult[0].id;

    // Create test controls
    const testControls: CreateControlInput[] = [
      {
        name: 'Access Control',
        description: 'User access management',
        control_type: 'Preventive',
        status: 'implemented',
        policy_id: policyId,
        owner: 'Security Team',
        implementation_date: new Date('2023-01-01'),
        last_audit_date: new Date('2023-06-01')
      },
      {
        name: 'Data Encryption',
        description: 'Data at rest encryption',
        control_type: 'Technical',
        status: 'draft',
        policy_id: null,
        owner: 'IT Team',
        implementation_date: null,
        last_audit_date: null
      }
    ];

    await db.insert(controlsTable)
      .values(testControls)
      .execute();

    const result = await getControls();

    expect(result).toHaveLength(2);
    
    // Verify first control
    const accessControl = result.find(c => c.name === 'Access Control');
    expect(accessControl).toBeDefined();
    expect(accessControl!.description).toEqual('User access management');
    expect(accessControl!.control_type).toEqual('Preventive');
    expect(accessControl!.status).toEqual('implemented');
    expect(accessControl!.policy_id).toEqual(policyId);
    expect(accessControl!.owner).toEqual('Security Team');
    expect(accessControl!.id).toBeDefined();
    expect(accessControl!.created_at).toBeInstanceOf(Date);
    expect(accessControl!.updated_at).toBeInstanceOf(Date);
    expect(accessControl!.implementation_date).toBeInstanceOf(Date);
    expect(accessControl!.last_audit_date).toBeInstanceOf(Date);

    // Verify second control
    const dataEncryption = result.find(c => c.name === 'Data Encryption');
    expect(dataEncryption).toBeDefined();
    expect(dataEncryption!.description).toEqual('Data at rest encryption');
    expect(dataEncryption!.control_type).toEqual('Technical');
    expect(dataEncryption!.status).toEqual('draft');
    expect(dataEncryption!.policy_id).toBeNull();
    expect(dataEncryption!.owner).toEqual('IT Team');
    expect(dataEncryption!.implementation_date).toBeNull();
    expect(dataEncryption!.last_audit_date).toBeNull();
  });

  it('should return controls in database order', async () => {
    // Create controls with different names
    const controlNames = ['Control A', 'Control B', 'Control C'];
    
    for (const name of controlNames) {
      await db.insert(controlsTable)
        .values({
          name,
          control_type: 'Technical',
          status: 'draft',
          owner: 'Test Owner'
        })
        .execute();
    }

    const result = await getControls();
    expect(result).toHaveLength(3);
    
    // Verify all controls are returned
    const resultNames = result.map(c => c.name);
    expect(resultNames).toContain('Control A');
    expect(resultNames).toContain('Control B');
    expect(resultNames).toContain('Control C');
  });
});
