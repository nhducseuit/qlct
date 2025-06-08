# Sprint 1 Test Cases

## I. App Initialization & Default Data
- [x] **TC_INIT_001:** On first launch (or when no categories exist), verify that initial/default categories (e.g., "Ăn uống", "Nhà ở", and their sub-categories) are automatically created.
- [x] **TC_INIT_002:** Verify that `useQuasar` (`$q`) is available for notifications.
- [x] **TC_INIT_003:** Verify that `dayjs` is configured and usable for date operations.

## II. Navigation & Basic Layout
- [x] **TC_NAV_001:** Verify the Main Layout (header, drawer, page container) is displayed.
- [x] **TC_NAV_002:** Click "Nhập liệu" link in the drawer: navigates to the home page (`/`) displaying the `QuickEntryForm`.
- [x] **TC_NAV_003:** Click "Quản lý Danh mục" link in the drawer: navigates to the categories management page (`/categories`).
- [x] **TC_NAV_004:** Click "Sao lưu & Khôi phục" link in the drawer: navigates to the backup/restore page (`/backup-restore`).
- [x] **TC_NAV_005:** Drawer can be opened and closed using the menu icon.
- [x] **TC_NAV_006:** Icons in the navigation drawer (`sym_o_edit_square`, `sym_o_category`, `sym_o_settings_backup_restore`) are displayed correctly.

## III. Category Management (via `categoryStore` logic, UI on `CategoriesPage` might be partial)

### III.A. Display
- [x] **TC_CAT_DISP_001:** Pinned categories are correctly identified and sorted by `order`.
- [x] **TC_CAT_DISP_002:** Visible (not hidden) categories are correctly identified and sorted by `order`.
- [x] **TC_CAT_DISP_003:** Hierarchical category structure (parents and children) is correctly computed.
- [x] **TC_CAT_DISP_004:** Category icons (Tabler Icons) are displayed correctly in lists.
- [x] **TC_CAT_DISP_005:** Category budget limit is displayed if set.

### III.B. Actions
- [x] **TC_CAT_ADD_001:** Add a new top-level category with all relevant fields (name, icon, order, etc.). Verify it appears in lists and DB.
- [x] **TC_CAT_ADD_002:** Add a new sub-category to an existing parent category. Verify it appears under the parent and in DB.
- [x] **TC_CAT_EDIT_001:** Edit an existing category's name. Verify change is reflected.
- [-] **TC_CAT_EDIT_002:** Edit an existing category's icon. Verify change is reflected.
- [x] **TC_CAT_PIN_001:** Pin an unpinned category. Verify `isPinned` status changes and it appears in pinned list.
- [x] **TC_CAT_PIN_002:** Unpin a pinned category. Verify `isPinned` status changes.
- [x] **TC_CAT_HIDE_001:** Hide a visible category. Verify `isHidden` status changes and it's excluded from `visibleCategories` and `hierarchicalCategories`.
- [-] **TC_CAT_HIDE_002:** Unhide a hidden category. Verify `isHidden` status changes.
- [x] **TC_CAT_ORDER_001:** Reorder a category upwards within its siblings. Verify `order` property changes for it and the swapped sibling.
- [x] **TC_CAT_ORDER_002:** Reorder a category downwards within its siblings. Verify `order` property changes.
```