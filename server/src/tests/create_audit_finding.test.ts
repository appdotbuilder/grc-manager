
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { auditFindingsTable, policiesTable, controlsTable } from '../db/schema';
import { type CreateAuditFindingInput } from '../schema';
import { createAuditFinding } from '../handlers/create_audit_finding';
import { eq } from 'drizzle-orm';

// Test input with all required fields
const testInput: CreateAuditFindingInput = {
  title: 'Test Audit Finding',
  description: 'A finding discovered during audit',
  status: 'open',
  control_id: null,
  policy_id: null,
  severity: 'medium',
  auditor: 'John Auditor',
  audit_date: new Date('2024-01-15'),
  due_date: new Date('2024-02-15'),
  remediation_plan: 'Implement corrective measures'
};

describe('createAuditFinding', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create an audit finding', async () => {
    const result = await createAuditFinding(testInput);

    // Basic field validation
    expect(result.title).toEqual('Test Audit Finding');
    expect(result.description).toEqual(testInput.description);
    expect(result.status).toEqual('open');
    expect(result.control_id).toBeNull();
    expect(result.policy_id).toBeNull();
    expect(result.severity).toEqual('medium');
    expect(result.auditor).toEqual('John Auditor');
    expect(result.audit_date).toEqual(testInput.audit_date);
    expect(result.due_date).toEqual(testInput.due_date);
    expect(result.remediation_plan).toEqual(testInput.remediation_plan);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save audit finding to database', async () => {
    const result = await createAuditFinding(testInput);

    // Query database to verify persistence
    const auditFindings = await db.select()
      .from(auditFindingsTable)
      .where(eq(auditFindingsTable.id, result.id))
      .execute();

    expect(auditFindings).toHaveLength(1);
    expect(auditFindings[0].title).toEqual('Test Audit Finding');
    expect(auditFindings[0].description).toEqual(testInput.description);
    expect(auditFindings[0].status).toEqual('open');
    expect(auditFindings[0].severity).toEqual('medium');
    expect(auditFindings[0].auditor).toEqual('John Auditor');
    expect(auditFindings[0].created_at).toBeInstanceOf(Date);
  });

  it('should create audit finding with foreign key references', async () => {
    // Create prerequisite policy
    const policyResult = await db.insert(policiesTable)
      .values({
        title: 'Test Policy',
        version: '1.0',
        effective_date: new Date('2024-01-01'),
        owner: 'Policy Owner'
      })
      .returning()
      .execute();

    // Create prerequisite control
    const controlResult = await db.insert(controlsTable)
      .values({
        name: 'Test Control',
        control_type: 'preventive',
        status: 'implemented',
        policy_id: policyResult[0].id,
        owner: 'Control Owner'
      })
      .returning()
      .execute();

    // Create audit finding with foreign key references
    const auditFindingInput: CreateAuditFindingInput = {
      ...testInput,
      control_id: controlResult[0].id,
      policy_id: policyResult[0].id
    };

    const result = await createAuditFinding(auditFindingInput);

    expect(result.control_id).toEqual(controlResult[0].id);
    expect(result.policy_id).toEqual(policyResult[0].id);

    // Verify in database
    const auditFindings = await db.select()
      .from(auditFindingsTable)
      .where(eq(auditFindingsTable.id, result.id))
      .execute();

    expect(auditFindings[0].control_id).toEqual(controlResult[0].id);
    expect(auditFindings[0].policy_id).toEqual(policyResult[0].id);
  });

  it('should handle null optional fields correctly', async () => {
    const inputWithNulls: CreateAuditFindingInput = {
      title: 'Minimal Audit Finding',
      description: null,
      status: 'in_progress',
      control_id: null,
      policy_id: null,
      severity: 'high',
      auditor: 'Jane Auditor',
      audit_date: new Date('2024-01-20'),
      due_date: null,
      remediation_plan: null
    };

    const result = await createAuditFinding(inputWithNulls);

    expect(result.description).toBeNull();
    expect(result.control_id).toBeNull();
    expect(result.policy_id).toBeNull();
    expect(result.due_date).toBeNull();
    expect(result.remediation_plan).toBeNull();
    expect(result.title).toEqual('Minimal Audit Finding');
    expect(result.status).toEqual('in_progress');
    expect(result.severity).toEqual('high');
  });
});
