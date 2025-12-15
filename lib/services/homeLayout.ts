import { connectToDatabase } from '@/lib/db';
import { HomeLayout, IHomeLayoutSection, DEFAULT_SECTIONS } from '@/models/HomeLayout';

export interface HomeLayoutResponse {
  sections: IHomeLayoutSection[];
}

/**
 * Get home layout for a store
 */
export async function getHomeLayout(storeId: string): Promise<HomeLayoutResponse> {
  await connectToDatabase();

  let layout = await HomeLayout.findOne({ storeId });

  // If no layout exists, create default
  if (!layout) {
    layout = await HomeLayout.create({
      storeId,
      sections: DEFAULT_SECTIONS,
    });
  }

  return {
    sections: layout.sections.sort((a, b) => a.position - b.position),
  };
}

/**
 * Update home layout sections order
 */
export async function updateHomeLayout(
  storeId: string,
  sections: IHomeLayoutSection[]
): Promise<HomeLayoutResponse> {
  await connectToDatabase();

  // Validate and normalize positions
  const normalizedSections = sections.map((section, index) => ({
    ...section,
    position: index,
  }));

  const layout = await HomeLayout.findOneAndUpdate(
    { storeId },
    { sections: normalizedSections },
    { new: true, upsert: true }
  );

  return {
    sections: layout.sections.sort((a, b) => a.position - b.position),
  };
}

/**
 * Toggle section visibility
 */
export async function toggleSectionVisibility(
  storeId: string,
  sectionType: string,
  isVisible: boolean
): Promise<HomeLayoutResponse> {
  await connectToDatabase();

  const layout = await HomeLayout.findOne({ storeId });

  if (!layout) {
    // Create with defaults and update the specific section
    const sections = DEFAULT_SECTIONS.map((s) =>
      s.type === sectionType ? { ...s, isVisible } : s
    );
    const newLayout = await HomeLayout.create({ storeId, sections });
    return { sections: newLayout.sections };
  }

  // Update the specific section
  const updatedSections = layout.sections.map((s) =>
    s.type === sectionType ? { ...s, isVisible } : s
  );

  layout.sections = updatedSections;
  await layout.save();

  return {
    sections: layout.sections.sort((a, b) => a.position - b.position),
  };
}
