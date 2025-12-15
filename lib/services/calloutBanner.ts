import { CalloutBanner, ICalloutBanner } from '@/models/CalloutBanner';
import { connectToDatabase } from '@/lib/db';

export interface CreateCalloutBannerInput {
  imageUrl: string;
  title: string;
  subTitle: string;
  buttonText: string;
  action: {
    type: 'collection' | 'navigation';
    collectionId?: string;
    navigateTo?: string;
  };
  position?: number;
  isActive?: boolean;
  backgroundColor?: string;
  textColor?: string;
  buttonColor?: string;
}

export interface UpdateCalloutBannerInput extends Partial<CreateCalloutBannerInput> {}

class CalloutBannerService {
  /**
   * Get all callout banners for a store
   */
  async getAll(storeId: string): Promise<ICalloutBanner[]> {
    await connectToDatabase();
    return CalloutBanner.find({ storeId }).sort({ position: 1 });
  }

  /**
   * Get a single callout banner by ID
   */
  async getById(storeId: string, id: string): Promise<ICalloutBanner | null> {
    await connectToDatabase();
    return CalloutBanner.findOne({ _id: id, storeId });
  }

  /**
   * Create a new callout banner
   */
  async create(storeId: string, input: CreateCalloutBannerInput): Promise<ICalloutBanner> {
    await connectToDatabase();

    // Get the next position
    const lastBanner = await CalloutBanner.findOne({ storeId })
      .sort({ position: -1 })
      .lean();

    const nextPosition = lastBanner ? (lastBanner.position as number) + 1 : 0;

    const banner = new CalloutBanner({
      storeId,
      ...input,
      position: input.position ?? nextPosition,
    });

    return banner.save();
  }

  /**
   * Update a callout banner
   */
  async update(
    storeId: string,
    id: string,
    input: UpdateCalloutBannerInput
  ): Promise<ICalloutBanner | null> {
    await connectToDatabase();
    return CalloutBanner.findOneAndUpdate(
      { _id: id, storeId },
      input,
      { new: true }
    );
  }

  /**
   * Delete a callout banner
   */
  async delete(storeId: string, id: string): Promise<boolean> {
    await connectToDatabase();
    const result = await CalloutBanner.deleteOne({ _id: id, storeId });
    return result.deletedCount > 0;
  }

  /**
   * Reorder callout banners
   */
  async reorder(storeId: string, items: Array<{ id: string; position: number }>): Promise<void> {
    await connectToDatabase();

    const updatePromises = items.map((item) =>
      CalloutBanner.findOneAndUpdate(
        { _id: item.id, storeId },
        { position: item.position }
      )
    );

    await Promise.all(updatePromises);
  }

  /**
   * Toggle isActive status
   */
  async toggleActive(storeId: string, id: string): Promise<ICalloutBanner | null> {
    await connectToDatabase();

    const banner = await CalloutBanner.findOne({ _id: id, storeId });
    if (!banner) return null;

    banner.isActive = !banner.isActive;
    return banner.save();
  }
}

export default new CalloutBannerService();
