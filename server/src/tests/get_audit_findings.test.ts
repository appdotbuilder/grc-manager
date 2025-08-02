
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { auditFindingsTable, policiesTable, controlsTable } from '../db/schema';
import { type CreateAuditFindingInput } from '../schema';
import { getAuditFindings } from '../handlers/get_audit_findings';

describe('getAuditFindings', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no audit findings exist', async () => {
    const result = await getAuditFindings();
    expect(result).toEqual([]);
  });

  it('should return all audit findings', async () => {
    // Create prerequisite policy and control
    const policyResult = await db.insert(policiesTable)
      .values({
        title: 'Test Policy',
        version: '1.0',
        effective_date: new Date(),
        owner: 'Test Owner'
      })
      .returning()
      .execute();

    const controlResult = await db.insert(controlsTable)
      .values({
        name: 'Test Control',
        control_type: 'Technical',
        status: 'draft',
        policy_id: policyResult[0].id,
        owner: 'Test Owner'
      })
      .returning()
      .execute();

    // Create test audit findings
    const testFindings: CreateAuditFindingInput[] = [
      {
        title: 'Finding 1',
        description: 'First audit finding',
        status: 'open',
        control_id: controlResult[0].id,
        policy_id: policyResult[0].id,
        severity: 'high',
        auditor: 'Auditor 1',
        audit_date: new Date(),
        due_date: null,
        remediation_plan: null
      },
      {
        title: 'Finding 2',
        description: 'Second audit finding',
        status: 'in_progress',
        control_id: controlResult[0].id,
        policy_id: policyResult[0].id,
        severity: 'medium',
        auditor: 'Auditor 2',
        audit_date: new Date(),
        due_date: new Date(),
        remediation_plan: 'Fix the issue'
      }
    ];

    await db.insert(auditFindingsTable)
      .values(testFindings)
      .execute();

    const result = await getAuditFindings();

    expect(result).toHaveLength(2);
    
    // Verify first finding
    expect(result[0].title).toEqual('Finding 1');
    expect(result[0].description).toEqual('First audit finding');
    expect(result[0].status).toEqual('open');
    expect(result[0].severity).toEqual('high');
    expect(result[0].auditor).toEqual('Auditor 1');
    expect(result[0].id).toBeDefined();
    expect(result[0].created_at).toBeInstanceOf(Date);
    expect(result[0].updated_at).toBeInstanceOf(Date);

    // Verify second finding
    expect(result[1].title).toEqual('Finding 2');
    expect(result[1].description).toEqual('Second audit finding');
    expect(result[1].status).toEqual('in_progress');
    expect(result[1].severity).toEqual('medium');
    expect(result[1].auditor).toEqual('Auditor 2');
    expect(result[1].remediation_plan).toEqual('Fix the issue');
  });

  it('should handle findings without optional foreign keys', async () => {
    // Create audit finding without control_id and policy_id
    const testInput: CreateAuditFindingInput = {
      title: 'Standalone Finding',
      description: 'Finding without control or policy reference',
      status: 'resolved',
      control_id: null,
      policy_id: null,
      severity: 'low',
      auditor: 'Independent Auditor',
      audit_date: new Date(),
      due_date: null,
      remediation_plan: null
    };

    await db.insert(auditFindingsTable)
      .values(testInput)
      .execute();

    const result = await getAuditFindings();

    expect(result).toHaveLength(1);
    expect(result[0].title).toEqual('Standalone Finding');
    expect(result[0].control_id).toBeNull();
    expect(result[0].policy_id).toBeNull();
    expect(result[0].status).toEqual('resolved');
    expect(result[0].severity).toEqual('low');
  });
});
