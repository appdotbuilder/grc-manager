
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { risksTable, controlsTable, policiesTable } from '../db/schema';
import { getRisks } from '../handlers/get_risks';
import { type CreateRiskInput } from '../schema';

describe('getRisks', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no risks exist', async () => {
    const result = await getRisks();
    expect(result).toEqual([]);
  });

  it('should return all risks', async () => {
    // Create prerequisite policy
    const [policy] = await db.insert(policiesTable)
      .values({
        title: 'Test Policy',
        version: '1.0',
        effective_date: new Date(),
        owner: 'Policy Owner'
      })
      .returning()
      .execute();

    // Create prerequisite control
    const [control] = await db.insert(controlsTable)
      .values({
        name: 'Test Control',
        control_type: 'Technical',
        status: 'implemented',
        policy_id: policy.id,
        owner: 'Control Owner'
      })
      .returning()
      .execute();

    // Create test risks
    const testRisk1: CreateRiskInput = {
      name: 'Data Breach Risk',
      description: 'Risk of unauthorized data access',
      risk_level: 'high',
      likelihood: 4,
      impact: 5,
      control_id: control.id,
      owner: 'Risk Owner 1',
      mitigation_strategy: 'Implement access controls'
    };

    const testRisk2: CreateRiskInput = {
      name: 'System Downtime Risk',
      description: 'Risk of system unavailability',
      risk_level: 'medium',
      likelihood: 3,
      impact: 3,
      control_id: null,
      owner: 'Risk Owner 2',
      mitigation_strategy: null
    };

    await db.insert(risksTable)
      .values([testRisk1, testRisk2])
      .execute();

    const result = await getRisks();

    expect(result).toHaveLength(2);
    
    // Verify first risk
    const risk1 = result.find(r => r.name === 'Data Breach Risk');
    expect(risk1).toBeDefined();
    expect(risk1!.description).toEqual('Risk of unauthorized data access');
    expect(risk1!.risk_level).toEqual('high');
    expect(risk1!.likelihood).toEqual(4);
    expect(risk1!.impact).toEqual(5);
    expect(risk1!.control_id).toEqual(control.id);
    expect(risk1!.owner).toEqual('Risk Owner 1');
    expect(risk1!.mitigation_strategy).toEqual('Implement access controls');
    expect(risk1!.id).toBeDefined();
    expect(risk1!.created_at).toBeInstanceOf(Date);
    expect(risk1!.updated_at).toBeInstanceOf(Date);

    // Verify second risk
    const risk2 = result.find(r => r.name === 'System Downtime Risk');
    expect(risk2).toBeDefined();
    expect(risk2!.description).toEqual('Risk of system unavailability');
    expect(risk2!.risk_level).toEqual('medium');
    expect(risk2!.likelihood).toEqual(3);
    expect(risk2!.impact).toEqual(3);
    expect(risk2!.control_id).toBeNull();
    expect(risk2!.owner).toEqual('Risk Owner 2');
    expect(risk2!.mitigation_strategy).toBeNull();
  });

  it('should return risks with all risk levels', async () => {
    // Create risks with different risk levels
    const riskInputs: CreateRiskInput[] = [
      {
        name: 'Low Risk',
        description: null,
        risk_level: 'low',
        likelihood: 1,
        impact: 1,
        control_id: null,
        owner: 'Owner 1',
        mitigation_strategy: null
      },
      {
        name: 'Critical Risk',
        description: null,
        risk_level: 'critical',
        likelihood: 5,
        impact: 5,
        control_id: null,
        owner: 'Owner 2',
        mitigation_strategy: null
      }
    ];

    await db.insert(risksTable)
      .values(riskInputs)
      .execute();

    const result = await getRisks();

    expect(result).toHaveLength(2);
    
    const riskLevels = result.map(r => r.risk_level);
    expect(riskLevels).toContain('low');
    expect(riskLevels).toContain('critical');
  });
});
