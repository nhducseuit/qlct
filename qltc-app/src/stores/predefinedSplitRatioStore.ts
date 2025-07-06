import { defineStore } from 'pinia';
import { ref, watch } from 'vue';
import { useQuasar } from 'quasar';
import { useAuthStore } from './authStore';
import { connect } from 'src/services/socketService';
import type { Socket } from 'socket.io-client';
import type { SplitRatioItem } from 'src/models';
import {
  fetchPredefinedSplitRatiosAPI,
  addPredefinedSplitRatioAPI,
  updatePredefinedSplitRatioAPI,
  deletePredefinedSplitRatioAPI,
  type CreatePredefinedSplitRatioPayload,
  type UpdatePredefinedSplitRatioPayload,
} from 'src/services/predefinedSplitRatioApiService';
import { useFamilyStore } from './familyStore';
import { AxiosError } from 'axios';

// Define the structure for a Predefined Split Ratio
export interface PredefinedSplitRatio {
  id: string;
  name: string;
  splitRatio: SplitRatioItem[]; // Array of { memberId: string, percentage: number }
  familyId: string;
  userId: string; // Assuming backend includes this
  createdAt: string;
  updatedAt: string;
}

export const usePredefinedSplitRatioStore = defineStore('predefinedSplitRatios', () => {
  const $q = useQuasar();
  const authStore = useAuthStore();
  const predefinedRatios = ref<PredefinedSplitRatio[]>([]);
  let storeSocket: Socket | null = null;
  const familyStore = useFamilyStore();

  // Watch for family change and reload ratios
  watch(
    () => familyStore.selectedFamilyId,
    () => {
      if (authStore.isAuthenticated) {
        void loadPredefinedRatios();
      }
    }
  );

  const loadPredefinedRatios = async () => {
    if (!authStore.isAuthenticated) {
      console.log('[PredefinedSplitRatioStore] User not authenticated, skipping load.');
      predefinedRatios.value = [];
      return;
    }
    // familyId is not passed to the API, but this check ensures we don't load if no family is selected
    const familyId = familyStore.selectedFamilyId;
    if (!familyId) {
      console.warn('[PredefinedSplitRatioStore] No family selected, skipping ratio load.');
      predefinedRatios.value = [];
      return;
    }
    try {
      console.log('[PredefinedSplitRatioStore] Loading predefined split ratios from API for the current family.');
      const fetchedRatios = await fetchPredefinedSplitRatiosAPI();
      predefinedRatios.value = fetchedRatios;
      console.log('[PredefinedSplitRatioStore] Predefined split ratios loaded:', predefinedRatios.value.length);
    } catch (error) {
      console.error('Failed to load predefined split ratios:', error);
      $q.notify({
        color: 'negative',
        message: 'Không thể tải tỷ lệ chia mặc định.',
        icon: 'report_problem',
      });
    }
  };

  const addPredefinedRatio = async (payload: CreatePredefinedSplitRatioPayload) => {
    if (!authStore.isAuthenticated) {
      $q.notify({ type: 'negative', message: 'Lỗi người dùng, không thể thêm tỷ lệ chia.' });
      throw new Error('User not authenticated');
    }

    try {
      // familyId is not part of the payload, it's handled by the backend
      const addedRatio = await addPredefinedSplitRatioAPI(payload);
      // WebSocket event will handle UI update
      $q.notify({ type: 'positive', message: 'Đã thêm tỷ lệ chia mặc định mới.' });
      return addedRatio;
    } catch (error) {
      console.error('Failed to add predefined split ratio:', error);
      $q.notify({ type: 'negative', message: 'Thêm tỷ lệ chia thất bại.', icon: 'report_problem' });
      throw error;
    }
  };

  const updatePredefinedRatio = async (id: string, payload: UpdatePredefinedSplitRatioPayload) => {
    if (!authStore.isAuthenticated) {
      $q.notify({ type: 'negative', message: 'Lỗi người dùng, không thể cập nhật tỷ lệ chia.' });
      throw new Error('User not authenticated');
    }
    try {
      const updatedRatio = await updatePredefinedSplitRatioAPI(id, payload);
      // WebSocket event will handle UI update
      $q.notify({ type: 'positive', message: 'Đã cập nhật tỷ lệ chia mặc định.' });
      return updatedRatio;
    } catch (error) {
      console.error('Failed to update predefined split ratio:', error);
      $q.notify({ type: 'negative', message: 'Cập nhật tỷ lệ chia thất bại.', icon: 'report_problem' });
      throw error;
    }
  };

  const deletePredefinedRatio = async (id: string) => {
    if (!authStore.isAuthenticated) {
      $q.notify({ type: 'negative', message: 'Lỗi người dùng, không thể xóa tỷ lệ chia.' });
      throw new Error('User not authenticated');
    }
    try {
      await deletePredefinedSplitRatioAPI(id);
      // WebSocket event will handle UI update
      $q.notify({ type: 'positive', message: 'Đã xóa tỷ lệ chia mặc định.' });
    } catch (error) {
      console.error('Failed to delete predefined split ratio:', error);
      // Error notification can be more specific if backend provides details
      if (error instanceof AxiosError && error.response?.data?.message) {
         $q.notify({ type: 'negative', message: `Xóa tỷ lệ chia thất bại: ${error.response.data.message}`, icon: 'report_problem' });
      } else {
         $q.notify({ type: 'negative', message: 'Xóa tỷ lệ chia thất bại.', icon: 'report_problem' });
      }
      throw error;
    }
  };

  const getRatioById = (id: string) => {
    return predefinedRatios.value.find(r => r.id === id);
  };

  const handlePredefinedRatioUpdate = () => {
    console.log('[PredefinedSplitRatioStore] Received predefined_split_ratios_updated event. Reloading ratios.');
    void loadPredefinedRatios();
  };

  // WebSocket connection logic
  const setupSocketListeners = () => {
    if (storeSocket) {
      storeSocket.off('predefined_split_ratios_updated', handlePredefinedRatioUpdate);
      storeSocket.on('predefined_split_ratios_updated', handlePredefinedRatioUpdate);
    }
  };

  const connectSocket = async () => {
    if (storeSocket?.connected) {
      console.log('[PredefinedSplitRatioStore] Socket already connected.');
      return;
    }
    try {
      console.log('[PredefinedSplitRatioStore] Connecting socket...');
      storeSocket = await connect();
      if (storeSocket) {
        console.log(`[PredefinedSplitRatioStore] Socket connected (${storeSocket.id}). Setting up WebSocket listeners.`);
        setupSocketListeners();
      } else {
        console.error('[PredefinedSplitRatioStore] Socket connection returned null.');
      }
    } catch (error) {
      console.error('[PredefinedSplitRatioStore] Socket connection failed:', error);
    }
  };

  const disconnectSocket = () => {
    if (storeSocket) {
      console.log('[PredefinedSplitRatioStore] Disconnecting socket...');
      storeSocket.off('predefined_split_ratios_updated', handlePredefinedRatioUpdate);
      storeSocket.disconnect();
      storeSocket = null;
    }
  };

  return {
    predefinedRatios,
    loadPredefinedRatios,
    addPredefinedRatio,
    updatePredefinedRatio,
    deletePredefinedRatio,
    getRatioById, // Expose the new getter
    connectSocket,
    disconnectSocket,
  };
});
