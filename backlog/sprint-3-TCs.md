# Sprint 3: Test Cases for Reporting

## Objective: Verify the accuracy and consistency of the financial reports under various filter conditions.

---

### TC3.1: Strict Mode Filtering
- **Given** "Chế độ nghiêm ngặt" (Strict Mode) is ON.
- **And** two members, "A" and "B", are selected in the global filter.
- **When** I view the "Phân tích theo Danh mục" report.
- **Then** the report should ONLY include shared expenses where BOTH "A" and "B" are part of the `splitRatio`.
- **And** the amounts for these transactions should be adjusted to reflect only the combined percentage share of "A" and "B".

### TC3.2: Non-Strict Mode Filtering
- **Given** "Chế độ nghiêm ngặt" (Strict Mode) is OFF.
- **And** two members, "A" and "B", are selected in the global filter.
- **When** I view the "Phân tích theo Danh mục" report.
- **Then** the report should include:
    - All non-shared transactions paid by either "A" or "B".
    - All shared transactions where EITHER "A" or "B" (or both) are part of the `splitRatio`.

### TC3.3: Income Exclusion Filter
- **Given** the "Loại trừ thu nhập" (Exclude Income) checkbox is checked.
- **When** I view any report.
- **Then** all calculations and chart visualizations should be based exclusively on 'expense' type transactions. No 'income' data should be visible.

### TC3.4: Report Drill-Down
- **Given** I am viewing the "Phân tích theo Danh mục" report.
- **When** I click on a specific category row (e.g., "Ăn uống").
- **Then** a transaction detail table should appear, showing only the transactions belonging to the "Ăn uống" category for the selected period and respecting all active global filters (members, strict mode, etc.).

### TC3.5: PDF Export
- **Given** a report is displayed on the screen.
- **When** I click the "Xuất PDF" button.
- **Then** a PDF file should be generated and downloaded.
- **And** the content of the PDF should accurately reflect the content of the report section on the page, formatted for A4 portrait layout.