import { connectToDatabase } from '@/lib/db';
import { CarouselItem } from '@/models/CarouselItem';
import { CategoryGrid } from '@/models/CategoryGrid';
import { CalloutBanner } from '@/models/CalloutBanner';
import { CollectionDisplay } from '@/models/CollectionDisplay';
import { CategoryCollectionGrid } from '@/models/CategoryCollectionGrid';
import { PromoBanner } from '@/models/PromoBanner';
import { CollectionShowcase } from '@/models/CollectionShowcase';
import {
  HomescreenPreviewData,
  CarouselItem as CarouselItemType,
  CategoryGridItem,
  CalloutBannerItem,
  CollectionDisplayItem,
  CategoryCollectionGridItem,
  PromoBannerItem,
  CollectionShowcaseItem,
} from '@/types';

/**
 * Format MongoDB document to API response format
 */
function formatDocument(doc: any): any {
  if (!doc) return null;
  const obj = doc.toObject ? doc.toObject() : doc;
  return {
    ...obj,
    id: obj._id?.toString() || obj.id,
    _id: undefined,
    __v: undefined,
  };
}

/**
 * Get all active components for homescreen preview
 */
export async function getHomescreenPreview(storeId: string): Promise<HomescreenPreviewData> {
  await connectToDatabase();

  // Fetch all active components in parallel
  const [
    carouselItems,
    categoryGridItems,
    calloutBannerItems,
    collectionDisplayItems,
    categoryCollectionGridItems,
    promoBannerItems,
    collectionShowcaseItems,
  ] = await Promise.all([
    CarouselItem.find({ storeId, isActive: true }).sort({ position: 1 }).lean(),
    CategoryGrid.find({ storeId, isActive: true }).sort({ position: 1 }).lean(),
    CalloutBanner.find({ storeId, isActive: true }).sort({ position: 1 }).lean(),
    CollectionDisplay.find({ storeId, isActive: true }).sort({ order: 1 }).lean(),
    CategoryCollectionGrid.find({ storeId, isActive: true }).sort({ position: 1 }).lean(),
    PromoBanner.find({ storeId, isActive: true }).sort({ position: 1 }).lean(),
    CollectionShowcase.find({ storeId, isActive: true }).sort({ position: 1 }).lean(),
  ]);

  // Format carousel items
  const carousel: CarouselItemType[] = carouselItems.map((item: any) => ({
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
  }));

  // Format category grid items
  const categoryGrid: CategoryGridItem[] = categoryGridItems.map((item: any) => ({
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

  // Format callout banners
  const calloutBanners: CalloutBannerItem[] = calloutBannerItems.map((item: any) => ({
    id: item._id.toString(),
    storeId: item.storeId,
    imageUrl: item.imageUrl,
    title: item.title,
    subTitle: item.subTitle,
    buttonText: item.buttonText,
    action: item.action,
    position: item.position,
    isActive: item.isActive,
    backgroundColor: item.backgroundColor,
    textColor: item.textColor,
    buttonColor: item.buttonColor,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  }));

  // Format collection displays
  const collectionDisplays: CollectionDisplayItem[] = collectionDisplayItems.map((item: any) => ({
    id: item._id.toString(),
    storeId: item.storeId,
    type: item.type,
    collectionId: item.collectionId,
    title: item.title,
    order: item.order,
    isActive: item.isActive,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  }));

  // Format category collection grids
  const categoryCollectionGrids: CategoryCollectionGridItem[] = categoryCollectionGridItems.map((item: any) => ({
    id: item._id.toString(),
    storeId: item.storeId,
    title: item.title,
    subtitle: item.subtitle,
    collections: item.collections || [],
    position: item.position,
    isActive: item.isActive,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  }));

  // Format promo banners
  const promoBanners: PromoBannerItem[] = promoBannerItems.map((item: any) => ({
    id: item._id.toString(),
    storeId: item.storeId,
    image: item.image,
    title: item.title,
    subtitle: item.subtitle,
    ctaText: item.ctaText,
    collectionId: item.collectionId,
    position: item.position,
    isActive: item.isActive,
    backgroundColor: item.backgroundColor,
    textColor: item.textColor,
    buttonColor: item.buttonColor,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  }));

  // Format collection showcases
  const collectionShowcases: CollectionShowcaseItem[] = collectionShowcaseItems.map((item: any) => ({
    id: item._id.toString(),
    storeId: item.storeId,
    type: item.type,
    title: item.title,
    icon: item.icon,
    collections: item.collections || [],
    position: item.position,
    isActive: item.isActive,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  }));

  // Calculate totals
  const activeComponents =
    carousel.length +
    categoryGrid.length +
    calloutBanners.length +
    collectionDisplays.length +
    categoryCollectionGrids.length +
    promoBanners.length +
    collectionShowcases.length;

  // Get total counts (including inactive)
  const [
    totalCarousel,
    totalCategoryGrid,
    totalCalloutBanners,
    totalCollectionDisplays,
    totalCategoryCollectionGrids,
    totalPromoBanners,
    totalCollectionShowcases,
  ] = await Promise.all([
    CarouselItem.countDocuments({ storeId }),
    CategoryGrid.countDocuments({ storeId }),
    CalloutBanner.countDocuments({ storeId }),
    CollectionDisplay.countDocuments({ storeId }),
    CategoryCollectionGrid.countDocuments({ storeId }),
    PromoBanner.countDocuments({ storeId }),
    CollectionShowcase.countDocuments({ storeId }),
  ]);

  const totalComponents =
    totalCarousel +
    totalCategoryGrid +
    totalCalloutBanners +
    totalCollectionDisplays +
    totalCategoryCollectionGrids +
    totalPromoBanners +
    totalCollectionShowcases;

  return {
    carousel,
    categoryGrid,
    calloutBanners,
    collectionDisplays,
    categoryCollectionGrids,
    promoBanners,
    collectionShowcases,
    metadata: {
      totalComponents,
      activeComponents,
      lastUpdated: new Date().toISOString(),
    },
  };
}
