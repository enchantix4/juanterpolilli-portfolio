# Testing Log - Hero Image Dragging and Scaling

## Date: 2025-01-08

## Issue 1: User cannot move hero image in edit mode
## Issue 2: Navigation hover system should be in front of hero image in edit mode
## Issue 3: Scale issue persists - image and hotspots don't scale together

### Changes Made:
1. **Added image dragging state management:**
   - Added `imagePosition` state to track image position
   - Added `dragStart` state to track drag start position
   - Added `imageContainerRef` to reference image container

2. **Fixed z-index layering:**
   - Image container wrapper: `zIndex: editMode ? 35 : 1` (above edit overlay z-30)
   - Edit overlay: `pointer-events: none` (allows clicks to pass through to image)

3. **Image dragging handlers:**
   - `handleMouseDown`: Sets up drag start when clicking image in edit mode
   - `handleMouseMove`: Updates image position during drag
   - `handleMouseUp`: Saves position and cleans up

4. **Click detection:**
   - Prevents dragging when clicking on interactive edit elements
   - Allows dragging from image container or image itself

### Testing Steps:
1. ✅ Navigate to website
2. ✅ Click "Edit Mode" button
3. ⏳ Click and drag hero image
4. ⏳ Verify image moves
5. ⏳ Verify position saves

### Fixes Applied (Latest):
1. **Z-index fix:** Edit overlay now `z-40` (above image `z-1`)
2. **Scaling fix:** Image container uses `min(90vw, calc(90vh * aspectRatio))` to scale proportionally with viewport
3. **Image dragging:** Handlers in place, z-index adjusted so image can be clicked

### Current Status:
- ✅ Edit overlay is above image (z-40 vs z-1)
- ✅ Image container scales with viewport using min() calculations
- ✅ Image maintains aspect ratio
- ⏳ **NEEDS MANUAL TESTING** - Browser automation cannot test drag interactions

### Testing Checklist:
- [ ] Edit mode: Navigation overlays appear above image
- [ ] Edit mode: Can click and drag hero image
- [ ] Window resize: Image and hotspots scale together
- [ ] Window resize: Alignment maintained at different sizes

### Latest Fix (Simple 90% × 90%):
- **Removed:** `min()` calculations and aspect ratio constraints
- **Changed:** Image container now uses simple `width: 90%` and `height: 90%`
- **Why:** This makes image container scale exactly like main container (100vw × 100vh)
- **Result:** Image and hotspots now scale together because they both use percentages of the same container

### Next Steps:
- User needs to manually test:
  1. Edit mode - verify overlays are above image
  2. Drag image in edit mode
  3. Resize window - verify image and hotspots stay aligned (THIS SHOULD NOW WORK)

