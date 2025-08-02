
import { db } from '../db';
import { assetsTable } from '../db/schema';
import { type CreateAssetInput, type Asset } from '../schema';

export const createAsset = async (input: CreateAssetInput): Promise<Asset> => {
  try {
    // Insert asset record
    const result = await db.insert(assetsTable)
      .values({
        name: input.name,
        description: input.description,
        asset_type: input.asset_type,
        value: input.value ? input.value.toString() : null, // Convert number to string for numeric column
        owner: input.owner,
        location: input.location
      })
      .returning()
      .execute();

    // Convert numeric fields back to numbers before returning
    const asset = result[0];
    return {
      ...asset,
      value: asset.value ? parseFloat(asset.value) : null // Convert string back to number
    };
  } catch (error) {
    console.error('Asset creation failed:', error);
    throw error;
  }
};
