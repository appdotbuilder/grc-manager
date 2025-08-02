
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { assetsTable } from '../db/schema';
import { getAssets } from '../handlers/get_assets';

describe('getAssets', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no assets exist', async () => {
    const result = await getAssets();
    expect(result).toEqual([]);
  });

  it('should return all assets', async () => {
    // Create test assets
    await db.insert(assetsTable).values([
      {
        name: 'Server Asset',
        description: 'Production server',
        asset_type: 'hardware',
        value: '10000.50',
        owner: 'IT Team',
        location: 'Data Center'
      },
      {
        name: 'Software License',
        description: 'Enterprise software',
        asset_type: 'software',
        value: '5000.00',
        owner: 'IT Team',
        location: null
      }
    ]).execute();

    const result = await getAssets();

    expect(result).toHaveLength(2);
    
    // Verify first asset
    const serverAsset = result.find(asset => asset.name === 'Server Asset');
    expect(serverAsset).toBeDefined();
    expect(serverAsset!.description).toEqual('Production server');
    expect(serverAsset!.asset_type).toEqual('hardware');
    expect(serverAsset!.value).toEqual(10000.50);
    expect(typeof serverAsset!.value).toBe('number');
    expect(serverAsset!.owner).toEqual('IT Team');
    expect(serverAsset!.location).toEqual('Data Center');
    expect(serverAsset!.id).toBeDefined();
    expect(serverAsset!.created_at).toBeInstanceOf(Date);
    expect(serverAsset!.updated_at).toBeInstanceOf(Date);

    // Verify second asset
    const softwareAsset = result.find(asset => asset.name === 'Software License');
    expect(softwareAsset).toBeDefined();
    expect(softwareAsset!.value).toEqual(5000.00);
    expect(typeof softwareAsset!.value).toBe('number');
    expect(softwareAsset!.location).toBeNull();
  });

  it('should handle assets with null values correctly', async () => {
    await db.insert(assetsTable).values({
      name: 'Free Asset',
      description: null,
      asset_type: 'other',
      value: null,
      owner: 'Admin',
      location: null
    }).execute();

    const result = await getAssets();

    expect(result).toHaveLength(1);
    expect(result[0].name).toEqual('Free Asset');
    expect(result[0].description).toBeNull();
    expect(result[0].value).toBeNull();
    expect(result[0].location).toBeNull();
    expect(result[0].created_at).toBeInstanceOf(Date);
  });
});
