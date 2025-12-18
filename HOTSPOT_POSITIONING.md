# Hotspot Positioning Preservation

## Date: December 7, 2024

## Overview

This document explains how hotspot positions, connecting lines, and text labels are preserved across all screen sizes to maintain the original design intent.

---

## Key Principles

### 1. Percentage-Based Positioning
All hotspot elements use **percentage-based positioning** relative to the container, not fixed pixels. This ensures they scale proportionally with the screen size while maintaining their relative positions.

### 2. Consistent Container Sizing
The hero image container maintains **consistent sizing** (`w-[90%] h-[90%]`) across all devices to preserve the aspect ratio and relative positioning of all elements.

### 3. Relative Positioning
All elements (hotspots, lines, text labels) are positioned relative to the main container using `position: absolute` with percentage values.

---

## Implementation Details

### Hero Image Container
```tsx
<div className="relative w-[90%] h-[90%]">
  <Image
    src="/images/hero.png"
    fill
    className="object-contain"
    style={{ objectPosition: 'center bottom' }}
  />
</div>
```

**Key Points:**
- Container is always `90%` width and `90%` height (not responsive)
- `object-contain` ensures image maintains aspect ratio
- `objectPosition: 'center bottom'` ensures consistent image positioning

### Hotspot Boxes
```tsx
<button
  style={{
    top: activeSectionData.hotspot.top,      // e.g., '18%'
    left: activeSectionData.hotspot.left,     // e.g., '48%'
    width: activeSectionData.hotspot.width,  // e.g., '8%'
    height: activeSectionData.hotspot.height, // e.g., '6%'
    position: 'absolute',
  }}
/>
```

**Key Points:**
- All values are percentages relative to container
- Position is maintained regardless of screen size
- Touch targets are handled via percentage sizing, not fixed min-width

### Connecting Lines
```tsx
<svg style={{ width: '100%', height: '100%' }} preserveAspectRatio="none">
  <line
    x1={`${linePoints.startX}%`}
    y1={`${linePoints.startY}%`}
    x2={`${linePoints.endX}%`}
    y2={`${linePoints.endY}%`}
    vectorEffect="non-scaling-stroke"
  />
</svg>
```

**Key Points:**
- SVG uses percentage coordinates
- `preserveAspectRatio="none"` allows proper scaling
- `vectorEffect="non-scaling-stroke"` maintains line width

### Text Labels
```tsx
<button
  style={{
    top: activeSectionData.textPosition.top,   // e.g., '12%'
    left: activeSectionData.textPosition.left, // e.g., '10%'
    position: 'absolute',
  }}
/>
```

**Key Points:**
- Percentage-based positioning
- Font size uses `clamp()` for responsive scaling while maintaining position
- Position remains relative to container

---

## Hotspot Positions (Original Design)

### Resume
- Hotspot: `top: 18%`, `left: 48%`, `width: 8%`, `height: 6%`
- Text: `top: 12%`, `left: 10%`

### Bio
- Hotspot: `top: 28%`, `left: 42%`, `width: 8%`, `height: 6%`
- Text: `top: 28%`, `left: 12%`

### Sign Up
- Hotspot: `top: 52%`, `left: 38%`, `width: 8%`, `height: 6%`
- Text: `top: 50%`, `left: 14%`

### Music
- Hotspot: `top: 42%`, `right: 44%`, `width: 8%`, `height: 6%`
- Text: `top: 38%`, `right: 18%`

### Store
- Hotspot: `top: 72%`, `right: 40%`, `width: 8%`, `height: 6%`
- Text: `top: 68%`, `right: 20%`

---

## Why This Approach Works

1. **Percentage-Based**: All positioning uses percentages, so elements scale proportionally
2. **Container Consistency**: The hero image container maintains the same relative size (90%) on all devices
3. **Absolute Positioning**: All elements are absolutely positioned relative to the container
4. **Aspect Ratio Preservation**: `object-contain` ensures the image maintains its aspect ratio

---

## Responsive Considerations

### Mobile Devices
- Container remains `90%` width/height
- Hotspots scale proportionally with container
- Lines maintain their relative positions
- Text labels maintain their relative positions
- Touch interactions work correctly with percentage-based positioning

### Tablet Devices
- Same as mobile - container and positions remain consistent
- All elements scale proportionally

### Desktop Devices
- Original design maintained
- All positions exactly as intended

---

## Testing Checklist

- [x] Hotspot boxes maintain position on mobile
- [x] Hotspot boxes maintain position on tablet
- [x] Hotspot boxes maintain position on desktop
- [x] Connecting lines maintain position on all devices
- [x] Text labels maintain position on all devices
- [x] Hero image maintains aspect ratio
- [x] Container maintains consistent sizing
- [x] Touch interactions work correctly

---

## Status

✅ **Complete** - All hotspot positions, lines, and text labels are preserved across all screen sizes using percentage-based positioning relative to a consistently-sized container.

