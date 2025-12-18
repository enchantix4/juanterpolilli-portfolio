# Checkpoint 3 - Hero Image Hover Navigation System

## Date Saved
Current implementation state saved as checkpoint 3.

## Key Features Implemented

### 1. Edit Mode Access Control
- Edit mode is **only available** when URL contains `?edit=true` or `?edit=1`
- Normal visitors see no edit mode button
- Edit mode state is cleared when URL parameter is not present

### 2. Aspect Ratio Locked Scaling
- Image aspect ratio is calculated on load
- Both image container and hotspot container use CSS `aspect-ratio` property
- Hotspots scale proportionally with the image when window is resized
- Edit mode uses the same aspect-ratio-locked container structure

### 3. Hover Navigation System
- **Invisible hotspot areas** detect mouse entry for all sections (z-index 20 when inactive, 12 when active)
- **Instant switching** between sections when moving mouse between hotspot boxes
- **Visible elements** (box, line, text) only show for the active section
- **No glitching** - wrapper div prevents flickering when moving between box and text
- **Box is clickable** - clicking the hotspot box opens the pop-up modal

### 4. Hover Detection Improvements
- Uses `onMouseEnter`/`onMouseLeave` on hotspot areas instead of container-wide mouse move detection
- Invisible hotspot areas have higher z-index (20) when inactive to always receive hover events
- When active, invisible area z-index lowers to 12 so visible box (z-index 15) can receive clicks
- Container's `onMouseLeave` only clears when actually leaving the container, not when moving between hotspots

### 5. Coordinate System
- All coordinate calculations use `hotspotContainerRef` when `imageAspectRatio` is available
- Falls back to `containerRef` if aspect ratio not yet calculated
- Edit mode and normal mode use the same coordinate system

## Technical Details

### Z-Index Layering
- Image: z-index 1
- Hotspot container: z-index 10
- Invisible hotspot areas (inactive): z-index 20
- Invisible hotspot areas (active): z-index 12
- Visible wrapper: z-index 14
- Visible box/text: z-index 15
- Logo: z-index 20
- Edit mode controls: z-index 30+

### Pointer Events
- Invisible hotspot areas: `pointerEvents: 'auto'` (always clickable/hoverable)
- Visible wrapper: `pointerEvents: 'none'` (doesn't block hover events)
- Visible box/text: `pointerEvents: 'auto'` (clickable)

## Files Modified
- `app/components/HeroImage.tsx` - Complete hover navigation system implementation

## How to Restore
Copy `.checkpoints/HeroImage.checkpoint-3.tsx` to `app/components/HeroImage.tsx`





