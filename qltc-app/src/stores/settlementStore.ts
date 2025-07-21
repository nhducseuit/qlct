import { defineStore } from 'pinia';
import api from 'src/services/api'; // Adjust this import to your API utility
import type { CreateSettlementDto } from 'src/models/settlement';

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
    async loadBalances(personId: string, untilDate?: string) {
      if (!personId) {
        this.balances = [];
        return;
      }
      const params: Record<string, string> = { personId };
      if (untilDate) params.untilDate = untilDate;
      const response = await api.get('/settlements/balances', { params });
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
    async createSettlement(payload: CreateSettlementDto) {
      // Send the date as provided by the user (ISO string or YYYY-MM-DD)
      // If payload.date is already ISO or YYYY-MM-DD, backend should handle it
      await api.post('/settlements', payload);
      // Refresh balances and settlements after creation
      await this.loadBalances(payload.payerId);
      // Just reload all settlements (no filter by payerMembershipId)
      await this.loadSettlements();
    },
    async fetchPairBalance(personOneId: string, personTwoId: string, year: number, month: number) {
      // Call the backend API for a single pairwise balance
      const params = { personOneId, personTwoId, year, month };
      const response = await api.get('/settlements/balances', { params });
      const data = response?.data ?? response;
      // API returns { balances: [ ... ] } or { balances: [] }
      if (Array.isArray(data.balances) && data.balances.length > 0) {
        const b = data.balances[0];
        return {
          balance: b.netAmountPersonOneOwesPersonTwo,
          personOneName: b.memberOneName,
          personTwoName: b.memberTwoName,
        };
      } else {
        // No balance found, treat as settled
        return {
          balance: 0,
          personOneName: '',
          personTwoName: '',
        };
      }
    },
  },
});
