
---

## **SPRINT 2: Báo Cáo, Công Nợ, Xuất Ảnh, Giao Diện Nâng Cao**

> **Goal:**
> Hiển thị được các báo cáo tài chính theo tháng (tổng hợp & drilldown từng danh mục lớn/nhỏ), cảnh báo hạn mức, quản lý và clear công nợ chi chung, xuất báo cáo thành ảnh PNG/JPG tiện chia sẻ.

### **User Story 2.1: Báo cáo tổng thu chi, drilldown danh mục**

```markdown
### [UI] Báo cáo tổng hợp & drilldown

+----------------------------------------------------------+
| Báo cáo tháng 05/2025                                   |
+----------------------------------------------------------+
| Tổng thu:   32.000.000                                  |
| Tổng chi:   18.600.000                                  |
| Số dư:      13.400.000                                  |
+----------------------------------------------------------+
| [Biểu đồ tròn/cột]                                      |
| - Ăn uống:      4.200.000   (22%)                       |
| - Nhà ở:        3.800.000   (20%)                       |
| - ...                                                -> |
| (Click vào từng mục xem chi tiết danh mục nhỏ)           |
+----------------------------------------------------------+
| Báo hiệu hạn mức: Đỏ (vượt), Cam (gần), Xanh (an toàn)  |
+----------------------------------------------------------+
```

---

### **User Story 2.2: Quản lý công nợ chi chung, clear công nợ**

```markdown
### [UI] Công nợ chi chung

+----------------------------------------------------------+
| Công nợ chi chung đến hết 31/05/2025                    |
+----------------------------------------------------------+
| Anh A còn nợ Chị B:   1.250.000 VND                     |
| [Clear một phần] [Clear toàn bộ]                        |
+----------------------------------------------------------+
```

* “Clear một phần”: Nhập số tiền đã trả, hệ thống tự trừ.
* “Clear toàn bộ”: Reset về 0, lưu lịch sử trả nợ.

---

### **User Story 2.3: Xuất báo cáo ra ảnh (PNG/JPG)**

```markdown
### [UI] Xuất báo cáo

+----------------------------------------------------------+
| [Nút: Xuất báo cáo thành ảnh]                            |
| => Save/Share file PNG/JPG trực tiếp trên thiết bị       |
+----------------------------------------------------------+
```

---

### **User Story 2.4: Nâng cấp giao diện nhập liệu nhanh, filter/search danh mục**

```markdown
### [UI] Nhập liệu siêu tốc

+----------------------------------------------------------+
| Ô tìm kiếm: [gõ tên danh mục...]                        |
| Chọn nhanh: [Nổi bật] [Lịch sử nhập gần đây]            |
| ...                                                     |
+----------------------------------------------------------+
```

---

## **SPRINT 3: Tiện ích, UI nâng cao, backup/import nâng cao**

> **Goal:**
> Bổ sung các tiện ích nâng cao: giao diện tìm kiếm/filter danh mục, nhập liệu thông minh theo lịch sử, dark mode, giao diện đẹp tối ưu cho mobile/desktop, auto-gợi ý mục nổi bật, các tính năng tiện ích UX nâng cao khác tùy thời gian và nhu cầu thực tế.


* Tùy nhu cầu có thể bổ sung:

  * Dark mode
  * Xuất file Excel
  * Đa profile gia đình (cho nhà nhiều nhóm thu chi khác nhau)
  * Thêm nhiều ngôn ngữ, tối ưu UX
  * Cảnh báo tự động khi gần/chạm hạn mức
  * Gợi ý danh mục thông minh (AI/autocomplete từ lịch sử)

---