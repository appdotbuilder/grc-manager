
import { serial, text, pgTable, timestamp, numeric, integer, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Define enums
export const controlStatusEnum = pgEnum('control_status', ['draft', 'implemented', 'audited', 'compliant', 'non_compliant']);
export const riskLevelEnum = pgEnum('risk_level', ['low', 'medium', 'high', 'critical']);
export const incidentSeverityEnum = pgEnum('incident_severity', ['low', 'medium', 'high', 'critical']);
export const incidentStatusEnum = pgEnum('incident_status', ['open', 'investigating', 'resolved', 'closed']);
export const auditFindingStatusEnum = pgEnum('audit_finding_status', ['open', 'in_progress', 'resolved', 'closed']);
export const vulnerabilitySeverityEnum = pgEnum('vulnerability_severity', ['low', 'medium', 'high', 'critical']);

// Policies table
export const policiesTable = pgTable('policies', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  version: text('version').notNull(),
  effective_date: timestamp('effective_date').notNull(),
  review_date: timestamp('review_date'),
  owner: text('owner').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Controls table
export const controlsTable = pgTable('controls', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  control_type: text('control_type').notNull(),
  status: controlStatusEnum('status').notNull(),
  policy_id: integer('policy_id').references(() => policiesTable.id),
  owner: text('owner').notNull(),
  implementation_date: timestamp('implementation_date'),
  last_audit_date: timestamp('last_audit_date'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Risks table
export const risksTable = pgTable('risks', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  risk_level: riskLevelEnum('risk_level').notNull(),
  likelihood: integer('likelihood').notNull(),
  impact: integer('impact').notNull(),
  control_id: integer('control_id').references(() => controlsTable.id),
  owner: text('owner').notNull(),
  mitigation_strategy: text('mitigation_strategy'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Assets table
export const assetsTable = pgTable('assets', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  asset_type: text('asset_type').notNull(),
  value: numeric('value', { precision: 10, scale: 2 }),
  owner: text('owner').notNull(),
  location: text('location'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Vulnerabilities table
export const vulnerabilitiesTable = pgTable('vulnerabilities', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  severity: vulnerabilitySeverityEnum('severity').notNull(),
  asset_id: integer('asset_id').references(() => assetsTable.id),
  cve_id: text('cve_id'),
  discovered_date: timestamp('discovered_date').notNull(),
  remediation_plan: text('remediation_plan'),
  status: text('status').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Incidents table
export const incidentsTable = pgTable('incidents', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  severity: incidentSeverityEnum('severity').notNull(),
  status: incidentStatusEnum('status').notNull(),
  asset_id: integer('asset_id').references(() => assetsTable.id),
  discovered_date: timestamp('discovered_date').notNull(),
  resolved_date: timestamp('resolved_date'),
  root_cause: text('root_cause'),
  remediation_actions: text('remediation_actions'),
  reporter: text('reporter').notNull(),
  assigned_to: text('assigned_to'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Audit Findings table
export const auditFindingsTable = pgTable('audit_findings', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  status: auditFindingStatusEnum('status').notNull(),
  control_id: integer('control_id').references(() => controlsTable.id),
  policy_id: integer('policy_id').references(() => policiesTable.id),
  severity: text('severity').notNull(),
  auditor: text('auditor').notNull(),
  audit_date: timestamp('audit_date').notNull(),
  due_date: timestamp('due_date'),
  remediation_plan: text('remediation_plan'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Define relations
export const policiesRelations = relations(policiesTable, ({ many }) => ({
  controls: many(controlsTable),
  auditFindings: many(auditFindingsTable),
}));

export const controlsRelations = relations(controlsTable, ({ one, many }) => ({
  policy: one(policiesTable, {
    fields: [controlsTable.policy_id],
    references: [policiesTable.id],
  }),
  risks: many(risksTable),
  auditFindings: many(auditFindingsTable),
}));

export const risksRelations = relations(risksTable, ({ one }) => ({
  control: one(controlsTable, {
    fields: [risksTable.control_id],
    references: [controlsTable.id],
  }),
}));

export const assetsRelations = relations(assetsTable, ({ many }) => ({
  vulnerabilities: many(vulnerabilitiesTable),
  incidents: many(incidentsTable),
}));

export const vulnerabilitiesRelations = relations(vulnerabilitiesTable, ({ one }) => ({
  asset: one(assetsTable, {
    fields: [vulnerabilitiesTable.asset_id],
    references: [assetsTable.id],
  }),
}));

export const incidentsRelations = relations(incidentsTable, ({ one }) => ({
  asset: one(assetsTable, {
    fields: [incidentsTable.asset_id],
    references: [assetsTable.id],
  }),
}));

export const auditFindingsRelations = relations(auditFindingsTable, ({ one }) => ({
  control: one(controlsTable, {
    fields: [auditFindingsTable.control_id],
    references: [controlsTable.id],
  }),
  policy: one(policiesTable, {
    fields: [auditFindingsTable.policy_id],
    references: [policiesTable.id],
  }),
}));

// Export all tables for relation queries
export const tables = {
  policies: policiesTable,
  controls: controlsTable,
  risks: risksTable,
  assets: assetsTable,
  vulnerabilities: vulnerabilitiesTable,
  incidents: incidentsTable,
  auditFindings: auditFindingsTable,
};
