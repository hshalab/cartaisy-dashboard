import { connectToDatabase } from '@/lib/db';
import { CarouselItem, ICarouselItem } from '@/models/CarouselItem';

export interface CreateCarouselInput {
  imageUrl: string;
  label: string;
  title: string;
  subtitle: string;
  ctaText?: string;
  collectionId: string;
  endsAt?: string;
  promoTag?: {
    text?: string;
    imageUrl?: string;
    backgroundColor?: string;
    textColor?: string;
  };
  isActive?: boolean;
}

export interface UpdateCarouselInput extends Partial<CreateCarouselInput> {
  position?: number;
}

/**
 * Get all carousels for a store, sorted by position
 */
export async function getCarousels(storeId: string): Promise<any[]> {
  await connectToDatabase();

  const items = await CarouselItem.find({ storeId }).sort({ position: 1 });

  return items.map((item) => formatCarouselItem(item));
}

/**
 * Get a single carousel item
 */
export async function getCarousel(storeId: string, id: string): Promise<any> {
  await connectToDatabase();

  const item = await CarouselItem.findOne({ _id: id, storeId });
  if (!item) {
    throw new Error('Carousel item not found');
  }

  return formatCarouselItem(item);
}

/**
 * Create a new carousel item
 */
export async function createCarousel(
  storeId: string,
  data: CreateCarouselInput
): Promise<any> {
  await connectToDatabase();

  // Get the next position
  const lastItem = await CarouselItem.findOne({ storeId }).sort({ position: -1 });
  const nextPosition = (lastItem?.position || -1) + 1;

  const item = new CarouselItem({
    storeId,
    ...data,
    position: nextPosition,
    ctaText: data.ctaText || 'Shop Now',
    isActive: data.isActive !== false,
  });

  await item.save();

  return formatCarouselItem(item);
}

/**
 * Update a carousel item
 */
export async function updateCarousel(
  storeId: string,
  id: string,
  data: UpdateCarouselInput
): Promise<any> {
  await connectToDatabase();

  const item = await CarouselItem.findOne({ _id: id, storeId });
  if (!item) {
    throw new Error('Carousel item not found');
  }

  // Update fields
  if (data.imageUrl !== undefined) item.imageUrl = data.imageUrl;
  if (data.label !== undefined) item.label = data.label;
  if (data.title !== undefined) item.title = data.title;
  if (data.subtitle !== undefined) item.subtitle = data.subtitle;
  if (data.ctaText !== undefined) item.ctaText = data.ctaText;
  if (data.collectionId !== undefined) item.collectionId = data.collectionId;
  if (data.endsAt !== undefined) item.endsAt = data.endsAt ? new Date(data.endsAt) : undefined;
  if (data.promoTag !== undefined) item.promoTag = data.promoTag;
  if (data.position !== undefined) item.position = data.position;
  if (data.isActive !== undefined) item.isActive = data.isActive;

  await item.save();

  return formatCarouselItem(item);
}

/**
 * Delete a carousel item
 */
export async function deleteCarousel(storeId: string, id: string): Promise<void> {
  await connectToDatabase();

  const item = await CarouselItem.findOne({ _id: id, storeId });
  if (!item) {
    throw new Error('Carousel item not found');
  }

  await CarouselItem.deleteOne({ _id: id });
}

/**
 * Reorder multiple carousel items
 */
export async function reorderCarousels(
  storeId: string,
  items: { id: string; position: number }[]
): Promise<void> {
  await connectToDatabase();

  // Bulk update positions
  for (const item of items) {
    await CarouselItem.updateOne(
      { _id: item.id, storeId },
      { position: item.position }
    );
  }
}

/**
 * Get count of carousel items for a store
 */
export async function getCarouselCount(storeId: string): Promise<number> {
  await connectToDatabase();

  return CarouselItem.countDocuments({ storeId });
}

/**
 * Format carousel item for API response
 */
function formatCarouselItem(item: ICarouselItem): any {
  return {
    id: item._id.toString(),
    storeId: item.storeId,
    imageUrl: item.imageUrl,
    label: item.label,
    title: item.title,
    subtitle: item.subtitle,
    ctaText: item.ctaText,
    collectionId: item.collectionId,
    endsAt: item.endsAt ? item.endsAt.toISOString() : null,
    promoTag: item.promoTag || null,
    position: item.position,
    isActive: item.isActive,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  };
}
