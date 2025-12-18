# Testing Checklist

## Server Status
✅ Server is running on http://localhost:3000

## Features to Test

### 1. Hamburger Menu (Navigation)
**Location**: Top-left corner (hamburger icon)

**Test Steps**:
1. [ ] Click the hamburger icon (three horizontal lines)
2. [ ] Menu should slide in from the left
3. [ ] Menu should show 5 items: Bio, Sign Up, Resume, Music, Store
4. [ ] Menu items should be visible (black text on white background)
5. [ ] Click on a menu item (e.g., "Bio")
6. [ ] Modal should open for that section
7. [ ] Menu should close automatically after clicking
8. [ ] Click outside menu (on dark backdrop) - menu should close
9. [ ] Click hamburger again - menu should close

**Expected Behavior**:
- Menu slides in smoothly from left
- Menu items are clickable
- Menu closes when clicking outside or on an item
- Menu background is white with black text

### 2. Hover Navigation System
**Location**: Hero image area

**Test Steps**:
1. [ ] Move mouse over the hero image
2. [ ] Hover over area around top 18%, left 48% - "Resume" should appear
3. [ ] Hover over area around top 28%, left 42% - "Bio" should appear
4. [ ] Hover over area around top 52%, left 38% - "Sign Up" should appear
5. [ ] Hover over area around top 42%, right 44% - "Music" should appear
6. [ ] Hover over area around top 72%, right 40% - "Store" should appear

**For each hotspot, verify**:
- [ ] A bordered box appears at the hotspot location
- [ ] A connecting line appears from the box to the text label
- [ ] A text label appears (e.g., "Resume", "Bio", etc.)
- [ ] Text label scales up (1.4x) when hovering over it
- [ ] Clicking the box or label opens the corresponding modal

**Expected Behavior**:
- Hotspots are visible when hovering
- Lines connect hotspots to text labels
- Text labels are readable and scale on hover
- Clicking opens the correct modal

### 3. Edit Mode
**Location**: Top-right corner button

**Test Steps**:
1. [ ] Click "✏️ Edit Mode" button (top-right)
2. [ ] Button text should change to "✕ Exit Edit Mode"
3. [ ] Color picker panel should appear (top-right, below button)
4. [ ] All hotspots should be visible with blue borders
5. [ ] All text labels should be visible with green borders
6. [ ] All lines should be visible
7. [ ] Try dragging a hotspot - it should move
8. [ ] Try dragging a text label - it should move
9. [ ] Try dragging line start/end points - they should move
10. [ ] Try dragging the hero image - it should move
11. [ ] Try resizing a hotspot using the resize handles
12. [ ] Click "✕ Exit Edit Mode" - should return to normal view
13. [ ] Positions should be saved (refresh page - positions should persist)

**Expected Behavior**:
- Edit mode button is always visible
- All elements are editable in edit mode
- Dragging and resizing works smoothly
- Positions are saved to localStorage
- Color picker allows customization

## Known Hotspot Positions

- **Resume**: top: 18%, left: 48%, width: 12%, height: 10%
- **Bio**: top: 28%, left: 42%, width: 12%, height: 10%
- **Sign Up**: top: 52%, left: 38%, width: 12%, height: 10%
- **Music**: top: 42%, right: 44%, width: 12%, height: 10%
- **Store**: top: 72%, right: 40%, width: 12%, height: 10%

## Troubleshooting

If features don't work:

1. **Menu not opening**: Check browser console for errors
2. **Hover not working**: Verify mouse is over the image, not other elements
3. **Edit mode not showing**: Check that button is visible (should always be visible now)
4. **Elements not visible**: Check z-index values (menu: 50-60, hover: 30-35, edit: 100)

## Browser Console

Open browser DevTools (F12) and check:
- [ ] No JavaScript errors in Console tab
- [ ] No 404 errors for images or assets
- [ ] Network tab shows all resources loaded successfully









