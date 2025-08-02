
import { z } from 'zod';

// Enums for various status fields
export const controlStatusEnum = z.enum(['draft', 'implemented', 'audited', 'compliant', 'non_compliant']);
export type ControlStatus = z.infer<typeof controlStatusEnum>;

export const riskLevelEnum = z.enum(['low', 'medium', 'high', 'critical']);
export type RiskLevel = z.infer<typeof riskLevelEnum>;

export const incidentSeverityEnum = z.enum(['low', 'medium', 'high', 'critical']);
export type IncidentSeverity = z.infer<typeof incidentSeverityEnum>;

export const incidentStatusEnum = z.enum(['open', 'investigating', 'resolved', 'closed']);
export type IncidentStatus = z.infer<typeof incidentStatusEnum>;

export const auditFindingStatusEnum = z.enum(['open', 'in_progress', 'resolved', 'closed']);
export type AuditFindingStatus = z.infer<typeof auditFindingStatusEnum>;

export const vulnerabilitySeverityEnum = z.enum(['low', 'medium', 'high', 'critical']);
export type VulnerabilitySeverity = z.infer<typeof vulnerabilitySeverityEnum>;

// Policy schemas
export const policySchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string().nullable(),
  version: z.string(),
  effective_date: z.coerce.date(),
  review_date: z.coerce.date().nullable(),
  owner: z.string(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type Policy = z.infer<typeof policySchema>;

export const createPolicyInputSchema = z.object({
  title: z.string().min(1),
  description: z.string().nullable(),
  version: z.string().min(1),
  effective_date: z.coerce.date(),
  review_date: z.coerce.date().nullable(),
  owner: z.string().min(1)
});

export type CreatePolicyInput = z.infer<typeof createPolicyInputSchema>;

// Control schemas
export const controlSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable(),
  control_type: z.string(),
  status: controlStatusEnum,
  policy_id: z.number().nullable(),
  owner: z.string(),
  implementation_date: z.coerce.date().nullable(),
  last_audit_date: z.coerce.date().nullable(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type Control = z.infer<typeof controlSchema>;

export const createControlInputSchema = z.object({
  name: z.string().min(1),
  description: z.string().nullable(),
  control_type: z.string().min(1),
  status: controlStatusEnum,
  policy_id: z.number().nullable(),
  owner: z.string().min(1),
  implementation_date: z.coerce.date().nullable(),
  last_audit_date: z.coerce.date().nullable()
});

export type CreateControlInput = z.infer<typeof createControlInputSchema>;

// Risk schemas
export const riskSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable(),
  risk_level: riskLevelEnum,
  likelihood: z.number().int().min(1).max(5),
  impact: z.number().int().min(1).max(5),
  control_id: z.number().nullable(),
  owner: z.string(),
  mitigation_strategy: z.string().nullable(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type Risk = z.infer<typeof riskSchema>;

export const createRiskInputSchema = z.object({
  name: z.string().min(1),
  description: z.string().nullable(),
  risk_level: riskLevelEnum,
  likelihood: z.number().int().min(1).max(5),
  impact: z.number().int().min(1).max(5),
  control_id: z.number().nullable(),
  owner: z.string().min(1),
  mitigation_strategy: z.string().nullable()
});

export type CreateRiskInput = z.infer<typeof createRiskInputSchema>;

// Asset schemas
export const assetSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable(),
  asset_type: z.string(),
  value: z.number().nullable(),
  owner: z.string(),
  location: z.string().nullable(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type Asset = z.infer<typeof assetSchema>;

export const createAssetInputSchema = z.object({
  name: z.string().min(1),
  description: z.string().nullable(),
  asset_type: z.string().min(1),
  value: z.number().nullable(),
  owner: z.string().min(1),
  location: z.string().nullable()
});

export type CreateAssetInput = z.infer<typeof createAssetInputSchema>;

// Vulnerability schemas
export const vulnerabilitySchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable(),
  severity: vulnerabilitySeverityEnum,
  asset_id: z.number().nullable(),
  cve_id: z.string().nullable(),
  discovered_date: z.coerce.date(),
  remediation_plan: z.string().nullable(),
  status: z.string(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type Vulnerability = z.infer<typeof vulnerabilitySchema>;

export const createVulnerabilityInputSchema = z.object({
  name: z.string().min(1),
  description: z.string().nullable(),
  severity: vulnerabilitySeverityEnum,
  asset_id: z.number().nullable(),
  cve_id: z.string().nullable(),
  discovered_date: z.coerce.date(),
  remediation_plan: z.string().nullable(),
  status: z.string().min(1)
});

export type CreateVulnerabilityInput = z.infer<typeof createVulnerabilityInputSchema>;

// Incident schemas
export const incidentSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string().nullable(),
  severity: incidentSeverityEnum,
  status: incidentStatusEnum,
  asset_id: z.number().nullable(),
  discovered_date: z.coerce.date(),
  resolved_date: z.coerce.date().nullable(),
  root_cause: z.string().nullable(),
  remediation_actions: z.string().nullable(),
  reporter: z.string(),
  assigned_to: z.string().nullable(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type Incident = z.infer<typeof incidentSchema>;

export const createIncidentInputSchema = z.object({
  title: z.string().min(1),
  description: z.string().nullable(),
  severity: incidentSeverityEnum,
  status: incidentStatusEnum,
  asset_id: z.number().nullable(),
  discovered_date: z.coerce.date(),
  resolved_date: z.coerce.date().nullable(),
  root_cause: z.string().nullable(),
  remediation_actions: z.string().nullable(),
  reporter: z.string().min(1),
  assigned_to: z.string().nullable()
});

export type CreateIncidentInput = z.infer<typeof createIncidentInputSchema>;

// Audit Finding schemas
export const auditFindingSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string().nullable(),
  status: auditFindingStatusEnum,
  control_id: z.number().nullable(),
  policy_id: z.number().nullable(),
  severity: z.string(),
  auditor: z.string(),
  audit_date: z.coerce.date(),
  due_date: z.coerce.date().nullable(),
  remediation_plan: z.string().nullable(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type AuditFinding = z.infer<typeof auditFindingSchema>;

export const createAuditFindingInputSchema = z.object({
  title: z.string().min(1),
  description: z.string().nullable(),
  status: auditFindingStatusEnum,
  control_id: z.number().nullable(),
  policy_id: z.number().nullable(),
  severity: z.string().min(1),
  auditor: z.string().min(1),
  audit_date: z.coerce.date(),
  due_date: z.coerce.date().nullable(),
  remediation_plan: z.string().nullable()
});

export type CreateAuditFindingInput = z.infer<typeof createAuditFindingInputSchema>;
