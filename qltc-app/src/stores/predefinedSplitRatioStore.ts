import { defineStore } from 'pinia';
import { ref, onMounted } from 'vue';
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

// Define the structure for a Predefined Split Ratio
export interface PredefinedSplitRatio {
  id: string;
  name: string;
  splitRatio: SplitRatioItem[]; // Array of { memberId: string, percentage: number }
  userId: string; // Assuming backend includes this
  createdAt: string;
  updatedAt: string;
}

export const usePredefinedSplitRatioStore = defineStore('predefinedSplitRatios', () => {
  const $q = useQuasar();
  const authStore = useAuthStore();
  const predefinedRatios = ref<PredefinedSplitRatio[]>([]);
  let storeSocket: Socket | null = null;

  const loadPredefinedRatios = async () => {
    if (!authStore.isAuthenticated) {
      console.log('[PredefinedSplitRatioStore] User not authenticated, skipping load.');
      predefinedRatios.value = [];
      return;
    }
    try {
      console.log('[PredefinedSplitRatioStore] Loading predefined split ratios from API...');
      const fetchedRatios = await fetchPredefinedSplitRatiosAPI();
      predefinedRatios.value = fetchedRatios; // No specific sorting mentioned, keep as is or add
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
      $q.notify({ type: 'negative', message: 'Xóa tỷ lệ chia thất bại.', icon: 'report_problem' });
      throw error;
    }
  };


  const getPredefinedRatioById = (id: string): PredefinedSplitRatio | undefined => {
    return predefinedRatios.value.find(r => r.id === id);
  };

  // --- WebSocket Event Handling ---
  const handlePredefinedRatioUpdate = (data: { operation: string; item?: PredefinedSplitRatio; itemId?: string }) => {
    console.log('[PredefinedSplitRatioStore] Received predefined_split_ratios_updated event:', data);
    let changed = false;
    switch (data.operation) {
      case 'create':
        if (data.item) {
          const exists = predefinedRatios.value.some(r => r.id === data.item!.id);
          if (!exists) {
            predefinedRatios.value.push(data.item);
            changed = true;
          }
        }
        break;
      case 'update':
        if (data.item) {
          const index = predefinedRatios.value.findIndex(r => r.id === data.item!.id);
          if (index !== -1) {
            predefinedRatios.value.splice(index, 1, data.item);
            changed = true;
          } else {
            predefinedRatios.value.push(data.item); // If not found, might be new for this client
            changed = true;
          }
        }
        break;
      case 'delete':
        if (data.itemId) {
          const initialLength = predefinedRatios.value.length;
          predefinedRatios.value = predefinedRatios.value.filter(r => r.id !== data.itemId);
          if (predefinedRatios.value.length !== initialLength) changed = true;
        }
        break;
      default:
        console.warn('[PredefinedSplitRatioStore] Unknown operation from WebSocket:', data.operation);
    }
    if (changed) {
      // Optional: Add sorting if needed
      // predefinedRatios.value.sort((a, b) => a.name.localeCompare(b.name));
      console.log('[PredefinedSplitRatioStore] Predefined split ratio list updated. New length:', predefinedRatios.value.length);
    }
  };

  const setupSocketListeners = async () => {
    if (authStore.isAuthenticated) {
      try {
        console.log(`[PredefinedSplitRatioStore] Attempting to connect socket and set up listeners.`);
        const connectedSocketInstance = await connect();

        if (connectedSocketInstance?.connected) {
          storeSocket = connectedSocketInstance;
          console.log(`[PredefinedSplitRatioStore] Socket connected (${storeSocket.id}). Setting up WebSocket listeners for predefined_split_ratios_updated`);
          storeSocket.off('predefined_split_ratios_updated', handlePredefinedRatioUpdate);
          storeSocket.on('predefined_split_ratios_updated', handlePredefinedRatioUpdate);
        } else {
          console.warn('[PredefinedSplitRatioStore] Failed to connect socket or socket not connected after attempt. Listeners not set up.');
          if (storeSocket) {
              storeSocket.off('predefined_split_ratios_updated', handlePredefinedRatioUpdate);
              storeSocket = null;
          }
        }
      } catch (error) {
        console.error('[PredefinedSplitRatioStore] Error during socket connection or listener setup:', error);
        if (storeSocket) {
          storeSocket.off('predefined_split_ratios_updated', handlePredefinedRatioUpdate);
          storeSocket = null;
        }
      }
    } else {
      clearSocketListeners();
    }
  };

  const clearSocketListeners = () => {
    if (storeSocket) {
      console.log(`[PredefinedSplitRatioStore] Clearing WebSocket listeners for predefined_split_ratios_updated from socket ${storeSocket.id}`);
      storeSocket.off('predefined_split_ratios_updated', handlePredefinedRatioUpdate);
    }
    storeSocket = null;
  };

  onMounted(() => {
    if (authStore.isAuthenticated) {
      void loadPredefinedRatios();
      void setupSocketListeners();
    }
    authStore.$subscribe((_mutation, state) => {
      if (state.isAuthenticated) {
        void loadPredefinedRatios();
        void setupSocketListeners();
      } else {
        predefinedRatios.value = [];
        clearSocketListeners();
      }
    });
  });

  return {
    predefinedRatios,
    loadPredefinedRatios,
    getPredefinedRatioById,
    addPredefinedRatio,
    updatePredefinedRatio,
    deletePredefinedRatio,
  };
});
