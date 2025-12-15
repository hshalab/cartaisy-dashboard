import { CollectionShowcase, ICollectionShowcase, IShowcaseCollectionItem } from '@/models/CollectionShowcase';
import { connectToDatabase } from '@/lib/db';

export interface CreateCollectionShowcaseInput {
  type: 'grid' | 'circular';
  title: string;
  icon?: string;
  collections: IShowcaseCollectionItem[];
  position?: number;
  isActive?: boolean;
}

export interface UpdateCollectionShowcaseInput extends Partial<CreateCollectionShowcaseInput> {}

class CollectionShowcaseService {
  /**
   * Get all collection showcases for a store
   */
  async getAll(storeId: string): Promise<ICollectionShowcase[]> {
    await connectToDatabase();
    return CollectionShowcase.find({ storeId }).sort({ position: 1 });
  }

  /**
   * Get a single collection showcase by ID
   */
  async getById(storeId: string, id: string): Promise<ICollectionShowcase | null> {
    await connectToDatabase();
    return CollectionShowcase.findOne({ _id: id, storeId });
  }

  /**
   * Create a new collection showcase
   */
  async create(storeId: string, input: CreateCollectionShowcaseInput): Promise<ICollectionShowcase> {
    await connectToDatabase();

    // Get the next position
    const lastShowcase = await CollectionShowcase.findOne({ storeId })
      .sort({ position: -1 })
      .lean();

    const nextPosition = lastShowcase ? (lastShowcase.position as number) + 1 : 0;

    const showcase = new CollectionShowcase({
      storeId,
      ...input,
      position: input.position ?? nextPosition,
    });

    return showcase.save();
  }

  /**
   * Update a collection showcase
   */
  async update(
    storeId: string,
    id: string,
    input: UpdateCollectionShowcaseInput
  ): Promise<ICollectionShowcase | null> {
    await connectToDatabase();
    return CollectionShowcase.findOneAndUpdate(
      { _id: id, storeId },
      input,
      { new: true }
    );
  }

  /**
   * Delete a collection showcase
   */
  async delete(storeId: string, id: string): Promise<boolean> {
    await connectToDatabase();
    const result = await CollectionShowcase.deleteOne({ _id: id, storeId });
    return result.deletedCount > 0;
  }

  /**
   * Reorder collection showcases
   */
  async reorder(storeId: string, items: Array<{ id: string; position: number }>): Promise<void> {
    await connectToDatabase();

    const updatePromises = items.map((item) =>
      CollectionShowcase.findOneAndUpdate(
        { _id: item.id, storeId },
        { position: item.position }
      )
    );

    await Promise.all(updatePromises);
  }

  /**
   * Toggle isActive status
   */
  async toggleActive(storeId: string, id: string): Promise<ICollectionShowcase | null> {
    await connectToDatabase();

    const showcase = await CollectionShowcase.findOne({ _id: id, storeId });
    if (!showcase) return null;

    showcase.isActive = !showcase.isActive;
    return showcase.save();
  }

  /**
   * Get count of collection showcases for a store
   */
  async getCount(storeId: string): Promise<number> {
    await connectToDatabase();
    return CollectionShowcase.countDocuments({ storeId });
  }
}

export default new CollectionShowcaseService();
