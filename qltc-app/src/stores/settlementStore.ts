import { defineStore } from 'pinia';
import api from 'src/services/api'; // Adjust this import to your API utility

export const useSettlementStore = defineStore('settlement', {
  state: () => ({
    accessiblePersons: [] as Array<{ id: string; name: string }>,
    balances: [] as Array<{ personId: string; personName: string; amount: number }>,
    settlements: [] as Array<{
      id: string;
      payer: { personName: string };
      payee: { personName: string };
      amount: number;
      note?: string;
      date: string;
    }>,
    settlementsLoading: false as boolean,
    settlementsError: null as string | null,
    settlementsMeta: null as any,  //eslint-disable-line @typescript-eslint/no-explicit-any
  }),
  actions: {
    async loadAccessiblePersons() {
      const response = await api.get('/persons');
      // Axios returns { data, status, ... }, so use response.data if present
      this.accessiblePersons = Array.isArray(response) ? response : response.data ?? [];
    },
    async loadBalances(personId: string) {
      if (!personId) {
        this.balances = [];
        return;
      }
      const response = await api.get(`/settlements/balances?personId=${personId}`);
      // Support both Axios and fetch shapes
      const data = response?.data ?? response;
      // Map backend balances to table rows: show both directions for clarity
      if (Array.isArray(data.balances)) {
        type BalancePair = {
          personOneId: string;
          memberOneName: string;
          personTwoId: string;
          memberTwoName: string;
          netAmountPersonOneOwesPersonTwo: number;
        };
        interface BalanceRow {
          personId: string;
          personName: string;
          amount: number;
          counterpartyId: string;
          counterpartyName: string;
        }
        this.balances = (data.balances as BalancePair[]).flatMap((b): BalanceRow[] => [
          {
            personId: b.personOneId,
            personName: b.memberOneName,
            amount: b.netAmountPersonOneOwesPersonTwo,
            counterpartyId: b.personTwoId,
            counterpartyName: b.memberTwoName,
          },
          {
            personId: b.personTwoId,
            personName: b.memberTwoName,
            amount: -b.netAmountPersonOneOwesPersonTwo,
            counterpartyId: b.personOneId,
            counterpartyName: b.memberOneName,
          },
        ]).filter((row) => row.personId === personId);
      } else {
        this.balances = [];
      }
    },
    async loadSettlements(params = {}) {
      this.settlementsLoading = true;
      this.settlementsError = null;
      try {
        const response = await api.get('/settlements', { params });
        // Support both Axios and fetch shapes
        const data = response?.data ?? response;
        if (data && Array.isArray(data.items)) {
          this.settlements = data.items;
          // Optionally, expose meta for pagination
          this.settlementsMeta = data.meta;
        } else if (Array.isArray(data)) {
          this.settlements = data;
        } else {
          this.settlements = [];
        }
      } catch (e: unknown) {
        const err = e as { message?: string };
        this.settlementsError = err?.message || 'Không thể tải lịch sử thanh toán.';
        this.settlements = [];
      } finally {
        this.settlementsLoading = false;
      }
    },
    async createSettlement(payload: { payerId: string; payeeId: string; amount: number; note?: string }) {
      await api.post('/settlements', payload);
      // Optionally refresh balances and settlements after creation
      // await this.loadBalances(payload.payerId);
      // await this.loadSettlements();
    },
  },
});
