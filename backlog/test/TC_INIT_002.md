To test TC_INIT_002: Verify that useQuasar ($q) is available for notifications, you can perform an action in the application that is designed to trigger a Quasar notification.

Here's a simple way using the QuickEntryForm.vue:

Navigate to the "Nhập liệu" page (which displays the QuickEntryForm).
Attempt to submit the form without filling in required fields. For example, leave the "Số tiền" (Amount) field empty or "Hoặc chọn danh mục" (Category) unselected.
Click the "Lưu khoản này" (Save this item) button.
Expected Result:

A Quasar notification should appear on the screen, typically in a corner, with a message like "Vui lòng kiểm tra lại các trường thông tin." or specific validation errors for the fields.
There should be no errors in the browser's developer console related to $q or useQuasar being undefined or not a function.
This test confirms that $q.notify (which is accessed via useQuasar()) is correctly initialized and functional within your Vue components. The QuickEntryForm.vue explicitly uses $q.notify in its onSubmit method when validation fails or succeeds.