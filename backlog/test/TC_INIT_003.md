To test TC_INIT_003: Verify that dayjs is configured and usable for date operations, you can check if the date-related functionalities in your application are working as expected. The QuickEntryForm.vue is a good place for this.

Navigate to the "Nhập liệu" page (which displays the QuickEntryForm).
Observe the "Ngày giao dịch" (Transaction Date) field.
Expected: It should be pre-filled with the current date in YYYY/MM/DD format. This relies on dayjs().format('YYYY/MM/DD') in QuickEntryForm.vue.
Click on the calendar icon next to the date field.
Expected: A q-date popup should appear, allowing you to select a different date.
Select a different date from the popup.
Expected: The "Ngày giao dịch" field should update to the selected date, still in YYYY/MM/DD format.
Fill in other required fields (Category, Amount).
Submit the form.
Inspect the saved transaction data (either through a UI that lists transactions if available, or by checking the transactionStore state or IndexedDB).
Expected: The date field of the saved transaction in the transactionStore (and subsequently in the database) should be an ISO 8601 string (e.g., 2023-10-27T17:00:00.000Z). This conversion is done by dayjs(transactionData.date).toISOString() in transactionStore.ts.
If all these steps work correctly, it confirms that dayjs is configured, formatting dates for display, and converting them to ISO strings for storage. You can also check the browser console for any dayjs related errors