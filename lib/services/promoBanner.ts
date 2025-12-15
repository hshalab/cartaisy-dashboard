import { PromoBanner, IPromoBanner } from '@/models/PromoBanner';
import { connectToDatabase } from '@/lib/db';

export interface CreatePromoBannerInput {
  image: string;
  title: string;
  subtitle: string;
  ctaText: string;
  collectionId: string;
  position?: number;
  isActive?: boolean;
  backgroundColor?: string;
  textColor?: string;
  buttonColor?: string;
}

export interface UpdatePromoBannerInput extends Partial<CreatePromoBannerInput> {}

class PromoBannerService {
  /**
   * Get all promo banners for a store
   */
  async getAll(storeId: string): Promise<IPromoBanner[]> {
    await connectToDatabase();
    return PromoBanner.find({ storeId }).sort({ position: 1 });
  }

  /**
   * Get a single promo banner by ID
   */
  async getById(storeId: string, id: string): Promise<IPromoBanner | null> {
    await connectToDatabase();
    return PromoBanner.findOne({ _id: id, storeId });
  }

  /**
   * Create a new promo banner
   */
  async create(storeId: string, input: CreatePromoBannerInput): Promise<IPromoBanner> {
    await connectToDatabase();

    // Get the next position
    const lastBanner = await PromoBanner.findOne({ storeId })
      .sort({ position: -1 })
      .lean();

    const nextPosition = lastBanner ? (lastBanner.position as number) + 1 : 0;

    const banner = new PromoBanner({
      storeId,
      ...input,
      position: input.position ?? nextPosition,
    });

    return banner.save();
  }

  /**
   * Update a promo banner
   */
  async update(
    storeId: string,
    id: string,
    input: UpdatePromoBannerInput
  ): Promise<IPromoBanner | null> {
    await connectToDatabase();
    return PromoBanner.findOneAndUpdate(
      { _id: id, storeId },
      input,
      { new: true }
    );
  }

  /**
   * Delete a promo banner
   */
  async delete(storeId: string, id: string): Promise<boolean> {
    await connectToDatabase();
    const result = await PromoBanner.deleteOne({ _id: id, storeId });
    return result.deletedCount > 0;
  }

  /**
   * Reorder promo banners
   */
  async reorder(storeId: string, items: Array<{ id: string; position: number }>): Promise<void> {
    await connectToDatabase();

    const updatePromises = items.map((item) =>
      PromoBanner.findOneAndUpdate(
        { _id: item.id, storeId },
        { position: item.position }
      )
    );

    await Promise.all(updatePromises);
  }

  /**
   * Toggle isActive status
   */
  async toggleActive(storeId: string, id: string): Promise<IPromoBanner | null> {
    await connectToDatabase();

    const banner = await PromoBanner.findOne({ _id: id, storeId });
    if (!banner) return null;

    banner.isActive = !banner.isActive;
    return banner.save();
  }

  /**
   * Get count of promo banners for a store
   */
  async getCount(storeId: string): Promise<number> {
    await connectToDatabase();
    return PromoBanner.countDocuments({ storeId });
  }
}

export default new PromoBannerService();
