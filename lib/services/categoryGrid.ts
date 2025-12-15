import { CategoryGrid } from '@/models/CategoryGrid';
import { CreateCategoryGridInput, UpdateCategoryGridInput, CategoryGridItem } from '@/types';

export async function getCategoryGridItems(storeId: string): Promise<CategoryGridItem[]> {
  try {
    const items = await CategoryGrid.find({ storeId }).sort({ position: 1 }).lean();
    return items.map((item: any) => ({
      id: item._id.toString(),
      storeId: item.storeId,
      imageUrl: item.imageUrl,
      title: item.title,
      collectionId: item.collectionId,
      position: item.position,
      isActive: item.isActive,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    }));
  } catch (error) {
    console.error('Error fetching category grid items:', error);
    throw new Error('Failed to fetch category grid items');
  }
}

export async function getCategoryGridItem(storeId: string, id: string): Promise<CategoryGridItem> {
  try {
    const item = await CategoryGrid.findOne({ _id: id, storeId }).lean();
    if (!item) {
      throw new Error('Category grid item not found');
    }
    return {
      id: item._id.toString(),
      storeId: item.storeId,
      imageUrl: item.imageUrl,
      title: item.title,
      collectionId: item.collectionId,
      position: item.position,
      isActive: item.isActive,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    };
  } catch (error) {
    console.error('Error fetching category grid item:', error);
    throw error;
  }
}

export async function createCategoryGridItem(
  storeId: string,
  data: CreateCategoryGridInput
): Promise<CategoryGridItem> {
  try {
    // Get the next position
    const maxPositionItem = await CategoryGrid.findOne({ storeId })
      .sort({ position: -1 })
      .lean();
    const nextPosition = (maxPositionItem?.position ?? -1) + 1;

    const newItem = await CategoryGrid.create({
      storeId,
      ...data,
      position: nextPosition,
    });

    const item = await CategoryGrid.findById(newItem._id).lean();
    return {
      id: item!._id.toString(),
      storeId: item!.storeId,
      imageUrl: item!.imageUrl,
      title: item!.title,
      collectionId: item!.collectionId,
      position: item!.position,
      isActive: item!.isActive,
      createdAt: item!.createdAt.toISOString(),
      updatedAt: item!.updatedAt.toISOString(),
    };
  } catch (error) {
    console.error('Error creating category grid item:', error);
    throw new Error('Failed to create category grid item');
  }
}

export async function updateCategoryGridItem(
  storeId: string,
  id: string,
  data: UpdateCategoryGridInput
): Promise<CategoryGridItem> {
  try {
    const updated = await CategoryGrid.findOneAndUpdate({ _id: id, storeId }, data, {
      new: true,
      lean: true,
    });

    if (!updated) {
      throw new Error('Category grid item not found');
    }

    return {
      id: updated._id.toString(),
      storeId: updated.storeId,
      imageUrl: updated.imageUrl,
      title: updated.title,
      collectionId: updated.collectionId,
      position: updated.position,
      isActive: updated.isActive,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    };
  } catch (error) {
    console.error('Error updating category grid item:', error);
    throw error;
  }
}

export async function deleteCategoryGridItem(storeId: string, id: string): Promise<void> {
  try {
    const result = await CategoryGrid.deleteOne({ _id: id, storeId });
    if (result.deletedCount === 0) {
      throw new Error('Category grid item not found');
    }
  } catch (error) {
    console.error('Error deleting category grid item:', error);
    throw error;
  }
}

export async function reorderCategoryGridItems(
  storeId: string,
  items: Array<{ id: string; position: number }>
): Promise<void> {
  try {
    await Promise.all(
      items.map((item) =>
        CategoryGrid.updateOne(
          { _id: item.id, storeId },
          { position: item.position },
          { upsert: false }
        )
      )
    );
  } catch (error) {
    console.error('Error reordering category grid items:', error);
    throw new Error('Failed to reorder category grid items');
  }
}

export async function getCategoryGridCount(storeId: string): Promise<number> {
  try {
    return await CategoryGrid.countDocuments({ storeId });
  } catch (error) {
    console.error('Error getting category grid count:', error);
    throw new Error('Failed to get category grid count');
  }
}
