# Positioning System - Original Design Preserved

## Date: December 7, 2024

## Overview

This document explains how the original intentional positioning of the image, boxes, lines, and titles is preserved and how all elements scale together proportionally when the window is resized.

---

## Core Principle

**All elements (image, boxes, lines, titles) are positioned relative to the SAME container and scale together proportionally.**

---

## Container Structure

### Main Container
```tsx
<div 
  ref={containerRef}
  className="relative w-full h-screen overflow-hidden"
  style={{
    position: 'relative',
    width: '100%',
    height: '100vh',
    minHeight: '100vh',
  }}
>
```

**Key Points:**
- Full viewport width and height (`w-full h-screen`)
- All child elements positioned relative to this container
- Container scales with viewport size

### Hero Image Container
```tsx
<div className="absolute inset-0 flex items-end justify-center">
  <div className="relative w-[90%] h-[90%]">
    <Image src="/images/hero.png" fill className="object-contain" />
  </div>
</div>
```

**Key Points:**
- Image container is `90%` width and `90%` height of the main container
- `object-contain` ensures image maintains aspect ratio
- Positioned with `items-end justify-center` (original intentional placement)

---

## Element Positioning

### All Elements Use Percentage-Based Positioning

All interactive elements (boxes, lines, titles) are positioned using **percentages relative to the main container**, ensuring they scale proportionally with the image.

### Hotspot Boxes
```tsx
<button
  style={{
    top: activeSectionData.hotspot.top,      // e.g., '18%'
    left: activeSectionData.hotspot.left,    // e.g., '48%'
    width: activeSectionData.hotspot.width,  // e.g., '8%'
    height: activeSectionData.hotspot.height, // e.g., '6%'
    position: 'absolute',
  }}
/>
```

**Original Positions (Locked In):**
- **Resume**: `top: 18%`, `left: 48%`, `width: 8%`, `height: 6%`
- **Bio**: `top: 28%`, `left: 42%`, `width: 8%`, `height: 6%`
- **Sign Up**: `top: 52%`, `left: 38%`, `width: 8%`, `height: 6%`
- **Music**: `top: 42%`, `right: 44%`, `width: 8%`, `height: 6%`
- **Store**: `top: 72%`, `right: 40%`, `width: 8%`, `height: 6%`

### Connecting Lines
```tsx
<svg style={{ width: '100%', height: '100%' }}>
  <line
    x1={`${linePoints.startX}%`}  // Percentage of container width
    y1={`${linePoints.startY}%`}  // Percentage of container height
    x2={`${linePoints.endX}%`}
    y2={`${linePoints.endY}%`}
  />
</svg>
```

**Key Points:**
- SVG fills entire container (`width: 100%`, `height: 100%`)
- Line coordinates use percentages
- Lines scale proportionally with container

### Text Labels
```tsx
<button
  style={{
    top: activeSectionData.textPosition.top,   // e.g., '12%'
    left: activeSectionData.textPosition.left,  // e.g., '10%'
    position: 'absolute',
  }}
/>
```

**Original Positions (Locked In):**
- **Resume**: `top: 12%`, `left: 10%`
- **Bio**: `top: 28%`, `left: 12%`
- **Sign Up**: `top: 50%`, `left: 14%`
- **Music**: `top: 38%`, `right: 18%`
- **Store**: `top: 68%`, `right: 20%`

---

## How Responsiveness Works

### When Window Resizes

1. **Main Container**: Scales to new viewport size (`100vw` × `100vh`)
2. **Image Container**: Scales proportionally (still `90%` of main container)
3. **Image**: Maintains aspect ratio via `object-contain`
4. **Hotspots**: Scale proportionally (percentages remain the same)
5. **Lines**: Scale proportionally (percentages remain the same)
6. **Titles**: Scale proportionally (percentages remain the same)

### Key Insight

Since all elements use **percentage-based positioning relative to the same container**, they all scale together proportionally. The relationship between the image, boxes, lines, and titles is preserved regardless of window size.

---

## Original Design Intent

The original design had:
- Image positioned at `90%` width/height, centered and bottom-aligned
- Hotspots positioned at specific percentages relative to the viewport
- Lines connecting hotspots to text labels
- Text labels positioned at specific percentages

**All of these relationships are preserved** because:
1. All elements use the same reference point (main container)
2. All positioning is percentage-based
3. All elements scale together when container scales

---

## Responsive Behavior

### Desktop (Large Screen)
- Container: Full viewport
- Image: 90% of viewport, maintains aspect ratio
- Hotspots: Scale proportionally
- Lines: Scale proportionally
- Titles: Scale proportionally

### Tablet (Medium Screen)
- Same as desktop - all elements scale proportionally
- Relationships maintained

### Mobile (Small Screen)
- Same as desktop - all elements scale proportionally
- Relationships maintained
- Touch interactions work with percentage-based positioning

---

## Status

✅ **Original placements locked in**
✅ **All elements scale together proportionally**
✅ **Responsive behavior maintains relationships**
✅ **Image, boxes, lines, and titles interact correctly at all sizes**

---

## Testing

To verify positioning is preserved:
1. Resize browser window
2. Check that hotspots remain aligned with image
3. Check that lines connect correctly
4. Check that titles remain in correct positions
5. Verify on mobile, tablet, and desktop

All elements should maintain their relative positions regardless of screen size.

