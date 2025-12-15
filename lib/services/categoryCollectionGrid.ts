import { CategoryCollectionGrid, ICategoryCollectionGrid, ICollectionItem } from '@/models/CategoryCollectionGrid';
import { connectToDatabase } from '@/lib/db';

export interface CreateCategoryCollectionGridInput {
  title: string;
  subtitle: string;
  collections: ICollectionItem[];
  position?: number;
  isActive?: boolean;
}

export interface UpdateCategoryCollectionGridInput extends Partial<CreateCategoryCollectionGridInput> {}

class CategoryCollectionGridService {
  /**
   * Get all category collection grids for a store
   */
  async getAll(storeId: string): Promise<ICategoryCollectionGrid[]> {
    await connectToDatabase();
    return CategoryCollectionGrid.find({ storeId }).sort({ position: 1 });
  }

  /**
   * Get a single category collection grid by ID
   */
  async getById(storeId: string, id: string): Promise<ICategoryCollectionGrid | null> {
    await connectToDatabase();
    return CategoryCollectionGrid.findOne({ _id: id, storeId });
  }

  /**
   * Create a new category collection grid
   */
  async create(storeId: string, input: CreateCategoryCollectionGridInput): Promise<ICategoryCollectionGrid> {
    await connectToDatabase();

    // Get the next position
    const lastGrid = await CategoryCollectionGrid.findOne({ storeId })
      .sort({ position: -1 })
      .lean();

    const nextPosition = lastGrid ? (lastGrid.position as number) + 1 : 0;

    const grid = new CategoryCollectionGrid({
      storeId,
      ...input,
      position: input.position ?? nextPosition,
    });

    return grid.save();
  }

  /**
   * Update a category collection grid
   */
  async update(
    storeId: string,
    id: string,
    input: UpdateCategoryCollectionGridInput
  ): Promise<ICategoryCollectionGrid | null> {
    await connectToDatabase();
    return CategoryCollectionGrid.findOneAndUpdate(
      { _id: id, storeId },
      input,
      { new: true }
    );
  }

  /**
   * Delete a category collection grid
   */
  async delete(storeId: string, id: string): Promise<boolean> {
    await connectToDatabase();
    const result = await CategoryCollectionGrid.deleteOne({ _id: id, storeId });
    return result.deletedCount > 0;
  }

  /**
   * Reorder category collection grids
   */
  async reorder(storeId: string, items: Array<{ id: string; position: number }>): Promise<void> {
    await connectToDatabase();

    const updatePromises = items.map((item) =>
      CategoryCollectionGrid.findOneAndUpdate(
        { _id: item.id, storeId },
        { position: item.position }
      )
    );

    await Promise.all(updatePromises);
  }

  /**
   * Toggle isActive status
   */
  async toggleActive(storeId: string, id: string): Promise<ICategoryCollectionGrid | null> {
    await connectToDatabase();

    const grid = await CategoryCollectionGrid.findOne({ _id: id, storeId });
    if (!grid) return null;

    grid.isActive = !grid.isActive;
    return grid.save();
  }

  /**
   * Get count of category collection grids for a store
   */
  async getCount(storeId: string): Promise<number> {
    await connectToDatabase();
    return CategoryCollectionGrid.countDocuments({ storeId });
  }
}

export default new CategoryCollectionGridService();
