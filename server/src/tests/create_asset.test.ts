
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { assetsTable } from '../db/schema';
import { type CreateAssetInput } from '../schema';
import { createAsset } from '../handlers/create_asset';
import { eq } from 'drizzle-orm';

// Simple test input with all fields
const testInput: CreateAssetInput = {
  name: 'Test Server',
  description: 'A server for testing',
  asset_type: 'hardware',
  value: 5000.50,
  owner: 'IT Department',
  location: 'Data Center A'
};

// Test input with minimal required fields
const minimalInput: CreateAssetInput = {
  name: 'Minimal Asset',
  description: null,
  asset_type: 'software',
  value: null,
  owner: 'Security Team',
  location: null
};

describe('createAsset', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create an asset with all fields', async () => {
    const result = await createAsset(testInput);

    // Basic field validation
    expect(result.name).toEqual('Test Server');
    expect(result.description).toEqual('A server for testing');
    expect(result.asset_type).toEqual('hardware');
    expect(result.value).toEqual(5000.50);
    expect(typeof result.value).toEqual('number');
    expect(result.owner).toEqual('IT Department');
    expect(result.location).toEqual('Data Center A');
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should create an asset with minimal fields', async () => {
    const result = await createAsset(minimalInput);

    // Basic field validation
    expect(result.name).toEqual('Minimal Asset');
    expect(result.description).toBeNull();
    expect(result.asset_type).toEqual('software');
    expect(result.value).toBeNull();
    expect(result.owner).toEqual('Security Team');
    expect(result.location).toBeNull();
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save asset to database', async () => {
    const result = await createAsset(testInput);

    // Query using proper drizzle syntax
    const assets = await db.select()
      .from(assetsTable)
      .where(eq(assetsTable.id, result.id))
      .execute();

    expect(assets).toHaveLength(1);
    expect(assets[0].name).toEqual('Test Server');
    expect(assets[0].description).toEqual('A server for testing');
    expect(assets[0].asset_type).toEqual('hardware');
    expect(parseFloat(assets[0].value!)).toEqual(5000.50); // Convert from stored string
    expect(assets[0].owner).toEqual('IT Department');
    expect(assets[0].location).toEqual('Data Center A');
    expect(assets[0].created_at).toBeInstanceOf(Date);
    expect(assets[0].updated_at).toBeInstanceOf(Date);
  });

  it('should handle null value correctly', async () => {
    const result = await createAsset(minimalInput);

    // Query database to verify null value is stored correctly
    const assets = await db.select()
      .from(assetsTable)
      .where(eq(assetsTable.id, result.id))
      .execute();

    expect(assets[0].value).toBeNull();
    expect(result.value).toBeNull();
  });
});
