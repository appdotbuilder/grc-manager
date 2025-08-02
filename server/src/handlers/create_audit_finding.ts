
import { db } from '../db';
import { auditFindingsTable } from '../db/schema';
import { type CreateAuditFindingInput, type AuditFinding } from '../schema';

export const createAuditFinding = async (input: CreateAuditFindingInput): Promise<AuditFinding> => {
  try {
    // Insert audit finding record
    const result = await db.insert(auditFindingsTable)
      .values({
        title: input.title,
        description: input.description,
        status: input.status,
        control_id: input.control_id,
        policy_id: input.policy_id,
        severity: input.severity,
        auditor: input.auditor,
        audit_date: input.audit_date,
        due_date: input.due_date,
        remediation_plan: input.remediation_plan
      })
      .returning()
      .execute();

    return result[0];
  } catch (error) {
    console.error('Audit finding creation failed:', error);
    throw error;
  }
};
