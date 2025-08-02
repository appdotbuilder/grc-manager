
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { vulnerabilitiesTable, assetsTable } from '../db/schema';
import { type CreateVulnerabilityInput } from '../schema';
import { getVulnerabilities } from '../handlers/get_vulnerabilities';

describe('getVulnerabilities', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no vulnerabilities exist', async () => {
    const result = await getVulnerabilities();
    expect(result).toEqual([]);
  });

  it('should return all vulnerabilities', async () => {
    // Create test asset first (for foreign key reference)
    const assetResult = await db.insert(assetsTable)
      .values({
        name: 'Test Server',
        asset_type: 'server',
        owner: 'IT Team'
      })
      .returning()
      .execute();

    const assetId = assetResult[0].id;

    // Create test vulnerabilities
    const testVulnerabilities: CreateVulnerabilityInput[] = [
      {
        name: 'SQL Injection Vulnerability',
        description: 'Critical SQL injection in web app',
        severity: 'critical',
        asset_id: assetId,
        cve_id: 'CVE-2023-1234',
        discovered_date: new Date('2023-01-15'),
        remediation_plan: 'Apply security patch',
        status: 'open'
      },
      {
        name: 'Buffer Overflow',
        description: 'Buffer overflow in network service',
        severity: 'high',
        asset_id: null,
        cve_id: 'CVE-2023-5678',
        discovered_date: new Date('2023-02-20'),
        remediation_plan: 'Update service version',
        status: 'in_progress'
      }
    ];

    await db.insert(vulnerabilitiesTable)
      .values(testVulnerabilities)
      .execute();

    const result = await getVulnerabilities();

    expect(result).toHaveLength(2);
    
    // Verify first vulnerability
    const firstVuln = result.find(v => v.name === 'SQL Injection Vulnerability');
    expect(firstVuln).toBeDefined();
    expect(firstVuln!.description).toEqual('Critical SQL injection in web app');
    expect(firstVuln!.severity).toEqual('critical');
    expect(firstVuln!.asset_id).toEqual(assetId);
    expect(firstVuln!.cve_id).toEqual('CVE-2023-1234');
    expect(firstVuln!.discovered_date).toBeInstanceOf(Date);
    expect(firstVuln!.remediation_plan).toEqual('Apply security patch');
    expect(firstVuln!.status).toEqual('open');
    expect(firstVuln!.id).toBeDefined();
    expect(firstVuln!.created_at).toBeInstanceOf(Date);
    expect(firstVuln!.updated_at).toBeInstanceOf(Date);

    // Verify second vulnerability
    const secondVuln = result.find(v => v.name === 'Buffer Overflow');
    expect(secondVuln).toBeDefined();
    expect(secondVuln!.description).toEqual('Buffer overflow in network service');
    expect(secondVuln!.severity).toEqual('high');
    expect(secondVuln!.asset_id).toBeNull();
    expect(secondVuln!.cve_id).toEqual('CVE-2023-5678');
    expect(secondVuln!.status).toEqual('in_progress');
  });

  it('should handle vulnerabilities with null fields correctly', async () => {
    // Create vulnerability with minimal required fields
    const minimalVulnerability = {
      name: 'Test Vulnerability',
      description: null,
      severity: 'low' as const,
      asset_id: null,
      cve_id: null,
      discovered_date: new Date(),
      remediation_plan: null,
      status: 'open'
    };

    await db.insert(vulnerabilitiesTable)
      .values(minimalVulnerability)
      .execute();

    const result = await getVulnerabilities();

    expect(result).toHaveLength(1);
    expect(result[0].name).toEqual('Test Vulnerability');
    expect(result[0].description).toBeNull();
    expect(result[0].asset_id).toBeNull();
    expect(result[0].cve_id).toBeNull();
    expect(result[0].remediation_plan).toBeNull();
    expect(result[0].severity).toEqual('low');
    expect(result[0].status).toEqual('open');
    expect(result[0].discovered_date).toBeInstanceOf(Date);
  });
});
