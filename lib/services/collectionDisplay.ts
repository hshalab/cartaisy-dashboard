import { CollectionDisplay, ICollectionDisplay } from '@/models/CollectionDisplay';
import { connectToDatabase } from '@/lib/db';

export interface CreateCollectionDisplayInput {
  type: 'large_row' | 'small_grid' | 'medium_row';
  collectionId: string;
  title?: string;
  order?: number;
  isActive?: boolean;
}

export interface UpdateCollectionDisplayInput extends Partial<CreateCollectionDisplayInput> {}

class CollectionDisplayService {
  /**
   * Get all collection displays for a store
   */
  async getAll(storeId: string): Promise<ICollectionDisplay[]> {
    await connectToDatabase();
    return CollectionDisplay.find({ storeId }).sort({ order: 1 });
  }

  /**
   * Get a single collection display by ID
   */
  async getById(storeId: string, id: string): Promise<ICollectionDisplay | null> {
    await connectToDatabase();
    return CollectionDisplay.findOne({ _id: id, storeId });
  }

  /**
   * Create a new collection display
   */
  async create(storeId: string, input: CreateCollectionDisplayInput): Promise<ICollectionDisplay> {
    await connectToDatabase();

    // Get the next order position
    const lastDisplay = await CollectionDisplay.findOne({ storeId })
      .sort({ order: -1 })
      .lean();

    const nextOrder = lastDisplay ? (lastDisplay.order as number) + 1 : 0;

    const display = new CollectionDisplay({
      storeId,
      ...input,
      order: input.order ?? nextOrder,
    });

    return display.save();
  }

  /**
   * Update a collection display
   */
  async update(
    storeId: string,
    id: string,
    input: UpdateCollectionDisplayInput
  ): Promise<ICollectionDisplay | null> {
    await connectToDatabase();
    return CollectionDisplay.findOneAndUpdate(
      { _id: id, storeId },
      input,
      { new: true }
    );
  }

  /**
   * Delete a collection display
   */
  async delete(storeId: string, id: string): Promise<boolean> {
    await connectToDatabase();
    const result = await CollectionDisplay.deleteOne({ _id: id, storeId });
    return result.deletedCount > 0;
  }

  /**
   * Reorder collection displays
   */
  async reorder(storeId: string, items: Array<{ id: string; order: number }>): Promise<void> {
    await connectToDatabase();

    const updatePromises = items.map((item) =>
      CollectionDisplay.findOneAndUpdate(
        { _id: item.id, storeId },
        { order: item.order }
      )
    );

    await Promise.all(updatePromises);
  }

  /**
   * Toggle isActive status
   */
  async toggleActive(storeId: string, id: string): Promise<ICollectionDisplay | null> {
    await connectToDatabase();

    const display = await CollectionDisplay.findOne({ _id: id, storeId });
    if (!display) return null;

    display.isActive = !display.isActive;
    return display.save();
  }

  /**
   * Get count of collection displays for a store
   */
  async getCount(storeId: string): Promise<number> {
    await connectToDatabase();
    return CollectionDisplay.countDocuments({ storeId });
  }
}

export default new CollectionDisplayService();
