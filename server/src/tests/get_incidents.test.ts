
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { incidentsTable, assetsTable } from '../db/schema';
import { getIncidents } from '../handlers/get_incidents';
import { type CreateIncidentInput } from '../schema';

describe('getIncidents', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no incidents exist', async () => {
    const result = await getIncidents();
    expect(result).toEqual([]);
  });

  it('should return all incidents', async () => {
    // Create test asset first (for foreign key reference)
    const assetResult = await db.insert(assetsTable)
      .values({
        name: 'Test Server',
        asset_type: 'server',
        owner: 'IT Team'
      })
      .returning()
      .execute();

    const testAssetId = assetResult[0].id;

    // Create test incidents
    const testIncidents: CreateIncidentInput[] = [
      {
        title: 'Security Breach',
        description: 'Unauthorized access detected',
        severity: 'high',
        status: 'investigating',
        asset_id: testAssetId,
        discovered_date: new Date('2024-01-15'),
        resolved_date: null,
        root_cause: null,
        remediation_actions: 'Investigating the breach',
        reporter: 'Security Team',
        assigned_to: 'John Doe'
      },
      {
        title: 'System Outage',
        description: 'Server went down unexpectedly',
        severity: 'critical',
        status: 'resolved',
        asset_id: testAssetId,
        discovered_date: new Date('2024-01-10'),
        resolved_date: new Date('2024-01-11'),
        root_cause: 'Hardware failure',
        remediation_actions: 'Replaced faulty hardware',
        reporter: 'Monitoring System',
        assigned_to: 'Jane Smith'
      }
    ];

    // Insert test incidents
    await db.insert(incidentsTable)
      .values(testIncidents)
      .execute();

    const result = await getIncidents();

    expect(result).toHaveLength(2);
    
    // Verify first incident
    const incident1 = result.find(i => i.title === 'Security Breach');
    expect(incident1).toBeDefined();
    expect(incident1!.description).toEqual('Unauthorized access detected');
    expect(incident1!.severity).toEqual('high');
    expect(incident1!.status).toEqual('investigating');
    expect(incident1!.asset_id).toEqual(testAssetId);
    expect(incident1!.discovered_date).toBeInstanceOf(Date);
    expect(incident1!.resolved_date).toBeNull();
    expect(incident1!.reporter).toEqual('Security Team');
    expect(incident1!.assigned_to).toEqual('John Doe');
    expect(incident1!.id).toBeDefined();
    expect(incident1!.created_at).toBeInstanceOf(Date);
    expect(incident1!.updated_at).toBeInstanceOf(Date);

    // Verify second incident
    const incident2 = result.find(i => i.title === 'System Outage');
    expect(incident2).toBeDefined();
    expect(incident2!.description).toEqual('Server went down unexpectedly');
    expect(incident2!.severity).toEqual('critical');
    expect(incident2!.status).toEqual('resolved');
    expect(incident2!.resolved_date).toBeInstanceOf(Date);
    expect(incident2!.root_cause).toEqual('Hardware failure');
    expect(incident2!.remediation_actions).toEqual('Replaced faulty hardware');
  });

  it('should handle incidents with nullable fields', async () => {
    // Create incident with minimal required fields
    const minimalIncident: CreateIncidentInput = {
      title: 'Minor Issue',
      description: null,
      severity: 'low',
      status: 'open',
      asset_id: null,
      discovered_date: new Date('2024-01-20'),
      resolved_date: null,
      root_cause: null,
      remediation_actions: null,
      reporter: 'User Report',
      assigned_to: null
    };

    await db.insert(incidentsTable)
      .values(minimalIncident)
      .execute();

    const result = await getIncidents();

    expect(result).toHaveLength(1);
    const incident = result[0];
    expect(incident.title).toEqual('Minor Issue');
    expect(incident.description).toBeNull();
    expect(incident.asset_id).toBeNull();
    expect(incident.resolved_date).toBeNull();
    expect(incident.root_cause).toBeNull();
    expect(incident.remediation_actions).toBeNull();
    expect(incident.assigned_to).toBeNull();
    expect(incident.reporter).toEqual('User Report');
    expect(incident.severity).toEqual('low');
    expect(incident.status).toEqual('open');
  });
});
