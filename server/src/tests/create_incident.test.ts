
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { incidentsTable, assetsTable } from '../db/schema';
import { type CreateIncidentInput } from '../schema';
import { createIncident } from '../handlers/create_incident';
import { eq } from 'drizzle-orm';

// Simple test input
const testInput: CreateIncidentInput = {
  title: 'Test Security Incident',
  description: 'A security incident for testing',
  severity: 'high',
  status: 'open',
  asset_id: null,
  discovered_date: new Date('2024-01-15T10:00:00Z'),
  resolved_date: null,
  root_cause: null,
  remediation_actions: null,
  reporter: 'test.reporter@example.com',
  assigned_to: null
};

describe('createIncident', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create an incident', async () => {
    const result = await createIncident(testInput);

    // Basic field validation
    expect(result.title).toEqual('Test Security Incident');
    expect(result.description).toEqual(testInput.description);
    expect(result.severity).toEqual('high');
    expect(result.status).toEqual('open');
    expect(result.asset_id).toBeNull();
    expect(result.discovered_date).toEqual(testInput.discovered_date);
    expect(result.resolved_date).toBeNull();
    expect(result.root_cause).toBeNull();
    expect(result.remediation_actions).toBeNull();
    expect(result.reporter).toEqual('test.reporter@example.com');
    expect(result.assigned_to).toBeNull();
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save incident to database', async () => {
    const result = await createIncident(testInput);

    // Query using proper drizzle syntax
    const incidents = await db.select()
      .from(incidentsTable)
      .where(eq(incidentsTable.id, result.id))
      .execute();

    expect(incidents).toHaveLength(1);
    expect(incidents[0].title).toEqual('Test Security Incident');
    expect(incidents[0].description).toEqual(testInput.description);
    expect(incidents[0].severity).toEqual('high');
    expect(incidents[0].status).toEqual('open');
    expect(incidents[0].reporter).toEqual('test.reporter@example.com');
    expect(incidents[0].discovered_date).toEqual(testInput.discovered_date);
    expect(incidents[0].created_at).toBeInstanceOf(Date);
    expect(incidents[0].updated_at).toBeInstanceOf(Date);
  });

  it('should create incident with asset reference', async () => {
    // Create prerequisite asset first
    const assetResult = await db.insert(assetsTable)
      .values({
        name: 'Test Server',
        description: 'Server for testing',
        asset_type: 'server',
        value: null,
        owner: 'IT Department',
        location: 'Data Center'
      })
      .returning()
      .execute();

    const testInputWithAsset: CreateIncidentInput = {
      ...testInput,
      asset_id: assetResult[0].id
    };

    const result = await createIncident(testInputWithAsset);

    expect(result.asset_id).toEqual(assetResult[0].id);

    // Verify in database
    const incidents = await db.select()
      .from(incidentsTable)
      .where(eq(incidentsTable.id, result.id))
      .execute();

    expect(incidents[0].asset_id).toEqual(assetResult[0].id);
  });

  it('should create incident with all optional fields populated', async () => {
    const completeInput: CreateIncidentInput = {
      title: 'Complete Test Incident',
      description: 'A fully populated incident',
      severity: 'critical',
      status: 'investigating',
      asset_id: null,
      discovered_date: new Date('2024-01-15T10:00:00Z'),
      resolved_date: new Date('2024-01-16T15:30:00Z'),
      root_cause: 'Configuration error',
      remediation_actions: 'Applied security patch',
      reporter: 'security.team@example.com',
      assigned_to: 'incident.handler@example.com'
    };

    const result = await createIncident(completeInput);

    expect(result.title).toEqual('Complete Test Incident');
    expect(result.severity).toEqual('critical');
    expect(result.status).toEqual('investigating');
    expect(result.resolved_date).toEqual(completeInput.resolved_date);
    expect(result.root_cause).toEqual('Configuration error');
    expect(result.remediation_actions).toEqual('Applied security patch');
    expect(result.assigned_to).toEqual('incident.handler@example.com');
  });
});
