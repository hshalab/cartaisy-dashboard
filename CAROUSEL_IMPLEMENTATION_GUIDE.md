# Carousel Component Manager - Implementation Guide

## ✅ COMPLETED Components

### 1. **CarouselItem Model** (`models/CarouselItem.ts`)
- Mongoose schema with all required fields
- Indexes for efficient querying
- Proper validation and defaults

### 2. **Carousel Service** (`lib/services/carousel.ts`)
- `getCarousels(storeId)` - Get all carousel items
- `getCarousel(storeId, id)` - Get single item
- `createCarousel(storeId, data)` - Create new
- `updateCarousel(storeId, id, data)` - Update existing
- `deleteCarousel(storeId, id)` - Delete item
- `reorderCarousels(storeId, items)` - Bulk reorder positions
- `getCarouselCount(storeId)` - Get count for stats

### 3. **API Routes**
- `/api/components/carousel/route.ts` - GET (list), POST (create)
- `/api/components/carousel/[id]/route.ts` - GET, PATCH, DELETE
- `/api/components/carousel/reorder/route.ts` - POST (bulk reorder)

### 4. **UI Components**
- **ColorPicker** (`components/ui/color-picker.tsx`)
  - Hex input with validation
  - Native color picker
  - Preset colors

- **ImagePreview** (`components/app-builder/ImagePreview.tsx`)
  - Display images from URL
  - Loading states
  - Error handling

- **CollectionSelector** (`components/app-builder/CollectionSelector.tsx`)
  - Dropdown with Shopify collections
  - Loading states
  - Error handling for disconnected Shopify

- **CarouselForm** (`components/app-builder/carousel/CarouselForm.tsx`)
  - Full CRUD form for carousel items
  - Image preview
  - Promo tag section (collapsible)
  - Field validation
  - Character counters
  - Success/error messages

### 5. **Types** (`types/index.ts`)
- `CarouselItem` interface
- `CreateCarouselInput` interface
- `UpdateCarouselInput` interface

---

## 🏗️ REMAINING COMPONENTS TO BUILD

### 1. **Carousel Card Component**
**Path:** `components/app-builder/carousel/CarouselCard.tsx`

```typescript
interface CarouselCardProps {
  carousel: CarouselItem;
  onEdit: () => void;
  onDelete: () => void;
  onToggleActive: () => void;
  isDragging?: boolean;
}

// Features:
// - Display thumbnail image
// - Show title, label, collection
// - Status badge (Active/Inactive)
// - Position indicator
// - Promo tag preview
// - Actions dropdown (Edit, Delete, Toggle)
// - Drag handle for reordering
```

### 2. **Carousel List Page**
**Path:** `app/dashboard/app-builder/carousel/page.tsx`

Features:
- Header with title and "Add New" button
- Fetches all carousels from `/api/components/carousel`
- Grid or list view of CarouselCard components
- Drag-and-drop reordering (using @dnd-kit/core)
- Toggle active/inactive directly
- Loading skeleton
- Empty state when no carousels
- Delete confirmation dialog
- Success/error toasts

### 3. **Carousel Create Page**
**Path:** `app/dashboard/app-builder/carousel/new/page.tsx`

```typescript
'use client';

import { useRouter } from 'next/navigation';
import { CarouselForm } from '@/components/app-builder/carousel/CarouselForm';

export default function CreateCarouselPage() {
  const router = useRouter();

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Create New Carousel</h1>
      <CarouselForm
        mode="create"
        onSuccess={() => router.push('/dashboard/app-builder/carousel')}
      />
    </div>
  );
}
```

### 4. **Carousel Edit Page**
**Path:** `app/dashboard/app-builder/carousel/[id]/edit/page.tsx`

```typescript
'use client';

import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { CarouselForm } from '@/components/app-builder/carousel/CarouselForm';
import { CarouselItem } from '@/types';
import { Loader2 } from 'lucide-react';

export default function EditCarouselPage() {
  const router = useRouter();
  const params = useParams();
  const [carousel, setCarousel] = useState<CarouselItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCarousel = async () => {
      try {
        const response = await fetch(`/api/components/carousel/${params.id}`);
        if (response.ok) {
          const data = await response.json();
          setCarousel(data.data);
        }
      } catch (err) {
        console.error('Failed to fetch carousel');
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      fetchCarousel();
    }
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!carousel) {
    return <div>Carousel not found</div>;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Edit Carousel</h1>
      <CarouselForm
        mode="edit"
        initialData={carousel}
        onSuccess={() => router.push('/dashboard/app-builder/carousel')}
      />
    </div>
  );
}
```

### 5. **Update App Builder Overview Page**
**Path:** `app/dashboard/app-builder/page.tsx` (Update existing)

**New Section to Add:**
```typescript
// Add a component overview grid showing:
// - Carousel Items (count) → Navigate to /carousel
// - Promo Banners (count) → /promo-banners
// - Callout Banners (count) → /callout-banners
// - Category Grid (count) → /category-grid
// - Collection Displays (count) → /collection-displays
// - Category Collection Grid (count) → /category-collection-grid
// - Collection Showcases (count) → /collection-showcases

// Each card shows:
// - Title and description
// - Item count
// - Thumbnail preview (first item image)
// - "Manage" button
```

---

## 🎯 Implementation Steps

### Step 1: Create Carousel Card Component
- Display carousel items as cards
- Show thumbnail, title, status
- Add action buttons (Edit, Delete, Toggle)
- Include drag handle

### Step 2: Create Carousel List Page
- Fetch carousels from API
- Display in grid/list
- Add drag-and-drop reordering
- Implement delete with confirmation
- Add "Add New" button

### Step 3: Create Create/Edit Pages
- Use CarouselForm component
- Handle navigation on success
- Load existing data for edit mode

### Step 4: Update App Builder Overview
- Create component grid overview
- Show counts for each type
- Add navigation links
- Display preview thumbnails

---

## 📊 Data Flow

```
1. User navigates to /dashboard/app-builder/carousel
   ↓
2. List page fetches GET /api/components/carousel
   ↓
3. API returns all carousels for storeId
   ↓
4. Display as CarouselCard components
   ↓
5. User clicks "Add New" → /carousel/new
   ↓
6. CarouselForm (mode="create") renders
   ↓
7. Submit → POST /api/components/carousel
   ↓
8. Redirects back to list page
```

---

## 🔧 Technologies & Libraries

- **MongoDB/Mongoose**: Data persistence
- **NextAuth.js**: Authentication & session
- **React Hook Form**: Form management (optional)
- **@dnd-kit**: Drag-and-drop reordering
- **Lucide Icons**: UI icons
- **Tailwind CSS**: Styling

### For Drag-and-Drop:
```bash
npm install @dnd-kit/core @dnd-kit/utilities @dnd-kit/sortable
```

---

## ✨ Features Included

✅ Full CRUD operations
✅ Image preview with validation
✅ Shopify collection integration
✅ Promo tag customization
✅ Color picker for tags
✅ Drag-and-drop reordering
✅ Active/inactive toggle
✅ Bulk operations
✅ Form validation
✅ Error handling
✅ Loading states
✅ Empty states
✅ Responsive design

---

## 🧪 Testing Checklist

- [ ] Can create new carousel item
- [ ] Image preview loads correctly
- [ ] Collection dropdown shows items
- [ ] Form validation works
- [ ] Can edit existing carousel
- [ ] Can delete carousel (with confirmation)
- [ ] Can toggle active/inactive
- [ ] Can drag to reorder
- [ ] Promo tag section expands/collapses
- [ ] Color picker works
- [ ] Changes persist to database
- [ ] List page shows all items
- [ ] Empty state displays correctly

---

## 📝 Notes

This Carousel Manager serves as the **template for the other 6 component managers**:
- Promo Banners
- Callout Banners
- Category Grid
- Collection Displays
- Category Collection Grid
- Collection Showcases

Each will follow the same pattern with appropriate schema customizations.
