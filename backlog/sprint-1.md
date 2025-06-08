# Phần mềm quản lý chi tiêu cho hộ gia đình nhỏ

---

# 📚 **Backlog Quản Lý Thu Chi Gia Đình — Chi Tiết Theo Sprint**

---

## **SPRINT 1: Cơ Bản — Nhập Thu Chi, Quản Lý Danh Mục, Danh Mục Nổi Bật**

> **Goal:**
> Xây dựng xong toàn bộ khung nhập liệu thu - chi - thu nhập, quản lý linh hoạt danh mục lớn/nhỏ, cho phép người dùng pin danh mục ưu tiên lên màn nhập nhanh, thiết lập hạn mức và tỷ lệ chia chi chung. Dữ liệu được lưu local, có chức năng backup/restore.

### **User Story 1.1: Nhập khoản chi tiêu/thu nhập (Quick Entry UI)**

```markdown
### [UI] Màn hình Thêm khoản chi/thu nhập mới

+----------------------------------------------------------+
|      Thêm khoản chi tiêu / thu nhập mới                  |
+----------------------------------------------------------+
| Chọn nhanh:                                              |
| [🏠 Nhà ở]  [🍽️ Ăn ngoài]  [⚡ Điện]  [🛒 Mua sắm]         |
| [☕ Cafe]   [🚗 Đi lại]                                   |
|                    <== Có thể swipe/scroll nếu nhiều    |
+----------------------------------------------------------+
| Hoặc chọn danh mục:  ▼ (Mở menu phân cấp đầy đủ)         |
+----------------------------------------------------------+
| Ngày:      [ 2025-05-31   ▼ ]                            |
| Số tiền:   [__________] VND                              |
| Ghi chú:   [__________________________________]          |
| Ai chi:    ( ) Chồng    ( ) Vợ                           |
| Chi chung: [✓] (Nếu có, hiện chọn tỷ lệ chia)            |
| Tỷ lệ chia: [50/50 | 60/40 | ...] (tự lấy theo danh mục) |
+----------------------------------------------------------+
|      [Lưu khoản này]                                     |
+----------------------------------------------------------+
```

* “Chọn nhanh” gồm các mục nổi bật do user pin/ghim (mix lớn-nhỏ tuỳ ý, sắp xếp được thứ tự).
* Nếu chọn “Chi chung”, hiện combo chọn tỷ lệ chia hoặc tự lấy mặc định theo danh mục.
* Form này mobile-first, desktop view chỉ rộng hơn, có thể hiện nhiều “quick button” hơn.

---

### **User Story 1.2: Quản lý Danh Mục & Danh Mục Nổi Bật (Category Management)**

```markdown
### [UI] Quản lý Danh mục (Lớn - Nhỏ) & mục Nổi bật

+----------------------------------------------------------+
|   Quản lý danh mục chi tiêu                              |
+----------------------------------------------------------+
| [Danh mục lớn]       [Thêm mới danh mục lớn]             |
|    [↓] Nhà ở    (icon/color)      [Ẩn]  [Xoá]            |
|         - Thuê nhà     (icon)      [Ẩn][Xoá]             |
|         - Điện         (icon)      [Ẩn][Xoá]             |
|         - Nước         (icon)      [Ẩn][Xoá]             |
|    [↓] Ăn uống    (icon/color)    [Ẩn]  [Xoá]            |
|         - Ăn ngoài     (icon)      [Ẩn][Xoá] [✓ Nổi bật]  |
|         - Cafe         (icon)      [Ẩn][Xoá] [✓ Nổi bật]  |
| ...                                                      |
| [Thêm mới danh mục nhỏ cho “Ăn uống”]                    |
+----------------------------------------------------------+
| [Kéo thả sắp xếp], [Tick ✓ để pin Nổi bật], [Chỉnh icon] |
+----------------------------------------------------------+
```

* Danh mục lớn, nhỏ quản lý dạng "cây", kéo thả sắp xếp, đổi tên, đổi icon/màu.
* Tick vào “Nổi bật” để hiện ở màn nhập nhanh.
* Có thể ẩn thay vì xoá để không mất lịch sử báo cáo.

---

### **User Story 1.3: Thiết lập hạn mức, tỷ lệ chia danh mục**

```markdown
### [UI] Thiết lập hạn mức & tỷ lệ chia

+----------------------------------------------------------+
| Thiết lập hạn mức (tuỳ chọn, có thể để trống)            |
+----------------------------------------------------------+
| Danh mục lớn  |  Hạn mức (VND)  | Tỷ lệ chia chung (%)   |
|----------------------------------------------------------|
| Ăn uống       |   4.000.000     |  50/50                 |
| Nhà ở         |   3.000.000     |  60/40                 |
| Điện          |     800.000     |  70/30                 |
| ...           |   ...           |  ...                   |
+----------------------------------------------------------+
```

* Nếu là danh mục cá nhân thì tỷ lệ chia để trống hoặc mặc định 100/0.

---

## 🚀 **Tech Stack Chuẩn Đề Xuất (One Combo)**

* **Frontend:** Vue 3 (Composition API)
* **UI Framework:** Quasar Framework (chuẩn PWA, mobile-first, hỗ trợ cả desktop UI, drag-drop dễ)
* **State & Data Storage:** Pinia + IndexedDB (qua [Dexie.js](https://dexie.org/) — tối ưu lưu local, backup/restore tiện)
* **Export ảnh:** html2canvas (biến báo cáo/bảng thành PNG/JPG)
* **Xử lý ngày tháng:** dayjs
* **Icons:** Tabler Icons (rõ, đẹp, nhẹ)
* **Build:** PWA (Progressive Web App, chạy offline, cài như app)
* **Testing (optional):** Playwright (cho auto-test UI)
* **Không cần backend, không cần cloud, không cần account**

---

### **CHI TIẾT CÔNG VIỆC CHO SPRINT 1:**

**I. Setup Dự Án & Hạ Tầng Cốt Lõi (Project Setup & Core Infrastructure)**
*   [ ] **Task 1.1:** Khởi tạo dự án Vue 3 + Quasar Framework.
*   [ ] **Task 1.2:** Tích hợp Pinia cho quản lý state.
*   [ ] **Task 1.3:** Tích hợp Dexie.js để làm việc với IndexedDB.
*   [ ] **Task 1.4:** Cài đặt và cấu hình Tabler Icons.
*   [ ] **Task 1.5:** Cấu hình cơ bản PWA (manifest, service worker).
*   [ ] **Task 1.6:** Cài đặt `dayjs` để xử lý ngày tháng.

**II. Mô Hình Hóa Dữ Liệu & Lưu Trữ Cục Bộ (Data Modeling & Local Storage)**
*   [ ] **Task 2.1:** Định nghĩa data model cho `Category`:
    *   `id` (string, unique)
    *   `name` (string)
    *   `parentId` (string, nullable, for sub-categories)
    *   `icon` (string, tên icon từ Tabler Icons)
    *   `color` (string, mã màu hex, tùy chọn cho parent category)
    *   `isPinned` (boolean, default: false) - cho "Chọn nhanh"
    *   `order` (number) - để sắp xếp
    *   `isHidden` (boolean, default: false) - ẩn danh mục
    *   `defaultSplitRatio` (string, e.g., "50/50", "Chồng:100", "Vợ:100")
    *   `budgetLimit` (number, nullable)
*   [ ] **Task 2.2:** Định nghĩa data model cho `Transaction`:
    *   `id` (string, unique)
    *   `categoryId` (string, khóa ngoại tới Category)
    *   `amount` (number)
    *   `date` (string, ISO 8601 format, e.g., "2025-05-31")
    *   `note` (string, nullable)
    *   `type` (enum: 'income' | 'expense')
    *   `payer` (string, nullable, `userId` of the user who made the payment/received income. Null if not applicable or system-level.)
    *   `isShared` (boolean, default: false)
    *   `splitRatio` (string, nullable, e.g., "50/50", ghi đè `defaultSplitRatio` của category nếu có)
*   [ ] **Task 2.3:** Implement schema cho Dexie.js: bảng `categories` và `transactions`.
*   [ ] **Task 2.4:** Tạo Pinia store cho `categoryStore`:
    *   State: `categoriesList`
    *   Getters: `pinnedCategories`, `getCategoryById`, `getHierarchicalCategories`
    *   Actions: `loadCategories`, `addCategory`, `updateCategory`, `deleteCategory`, `togglePinCategory`, `reorderCategories`
*   [ ] **Task 2.5:** Tạo Pinia store cho `transactionStore`:
    *   State: `transactionsList`
    *   Getters: `getTransactionsByDateRange`, `getTransactionsByCategory`
    *   Actions: `loadTransactions`, `addTransaction`, `updateTransaction`, `deleteTransaction`
*   [ ] **Task 2.6:** (Tùy chọn) Logic khởi tạo dữ liệu mẫu cho danh mục.

**III. User Story 1.1: Nhập khoản chi tiêu/thu nhập (Quick Entry UI)**
*   [ ] **Task 3.1:** Xây dựng component `QuickEntryForm.vue`.
*   [ ] **Task 3.2:** Hiển thị các danh mục "Chọn nhanh" (lấy từ `categoryStore.pinnedCategories`).
    *   [ ] **Task 3.2.1:** Cho phép swipe/scroll nếu có nhiều mục "Chọn nhanh".
*   [ ] **Task 3.3:** Implement dropdown chọn danh mục đầy đủ (phân cấp).
*   [ ] **Task 3.4:** Tích hợp Quasar date picker (`q-date`) cho chọn ngày.
*   [ ] **Task 3.5:** Input nhập số tiền (Quasar `q-input` type number, định dạng VND).
*   [ ] **Task 3.6:** Input ghi chú (Quasar `q-input` type textarea).
*   [ ] **Task 3.7:** Lựa chọn "Ai chi" (Quasar `q-radio` hoặc `q-btn-toggle`).
*   [ ] **Task 3.8:** Checkbox "Chi chung" (Quasar `q-checkbox`).
    *   [ ] **Task 3.8.1:** Khi "Chi chung" được chọn, hiển thị lựa chọn tỷ lệ chia.
    *   [ ] **Task 3.8.2:** Tự động điền tỷ lệ chia mặc định từ danh mục, cho phép tùy chỉnh.
*   [ ] **Task 3.9:** Validate form (số tiền > 0, đã chọn ngày, đã chọn danh mục).
*   [ ] **Task 3.10:** Logic lưu transaction vào `transactionStore` (và persist qua Dexie).
*   [ ] **Task 3.11:** Đảm bảo UI responsive (mobile-first).

**IV. User Story 1.2: Quản lý Danh Mục & Danh Mục Nổi Bật (Category Management)**
*   [ ] **Task 4.1:** Xây dựng trang/component `CategoryManagementPage.vue`.
*   [ ] **Task 4.2:** Xây dựng component `CategoryListItem.vue` để hiển thị từng mục danh mục.
*   [ ] **Task 4.3:** Hiển thị danh mục dạng cây (cha-con).
*   [ ] **Task 4.4:** Chức năng thêm mới danh mục cha.
*   [ ] **Task 4.5:** Chức năng thêm mới danh mục con cho một danh mục cha đã chọn.
*   [ ] **Task 4.6:** Chức năng sửa tên, icon, màu sắc danh mục. (Cần component chọn icon).
*   [ ] **Task 4.7:** Chức năng ghim/bỏ ghim danh mục ("Nổi bật") - cập nhật `isPinned`.
*   [ ] **Task 4.8:** Chức năng ẩn/hiện danh mục - cập nhật `isHidden`.
*   [ ] **Task 4.9:** Chức năng xóa danh mục (cân nhắc soft delete hoặc cảnh báo nếu có transaction liên quan).
*   [ ] **Task 4.10:** Implement kéo thả để sắp xếp thứ tự danh mục (sử dụng thư viện hỗ trợ drag-drop của Quasar hoặc tương tự).

**V. User Story 1.3: Thiết lập hạn mức, tỷ lệ chia danh mục**
*   [ ] **Task 5.1:** Xây dựng trang/component `CategorySettingsPage.vue` (hoặc tích hợp vào `CategoryManagementPage`).
*   [ ] **Task 5.2:** Hiển thị danh sách danh mục (cha hoặc tất cả) để thiết lập.
*   [ ] **Task 5.3:** Input thiết lập hạn mức (VND) cho mỗi danh mục.
*   [ ] **Task 5.4:** Input/select thiết lập tỷ lệ chia chung mặc định cho mỗi danh mục.
*   [ ] **Task 5.5:** Logic lưu các thiết lập này vào `categoryStore` (và persist qua Dexie).

**VI. Kiểm Thử & Hoàn Thiện (Testing & Refinement)**
*   [ ] **Task 7.1:** Kiểm thử thủ công toàn bộ các user story.
*   [ ] **Task 7.2:** Kiểm thử validation dữ liệu nhập.
*   [ ] **Task 7.3:** Mock UI báo cáo đơn giản để kiểm tra tính toàn vẹn dữ liệu (ví dụ: tổng chi theo một danh mục).

---
