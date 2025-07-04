import { defineStore } from 'pinia';
import { ref } from 'vue';
import {
  fetchHouseholdMembersAPI,
  addHouseholdMemberAPI,
  updateHouseholdMemberAPI,
  deleteHouseholdMemberAPI,
  type CreateHouseholdMemberPayload,
  type UpdateHouseholdMemberPayload,
} from 'src/services/householdMemberApiService';
import type { HouseholdMember } from 'src/models';
import { useQuasar } from 'quasar';
import { useAuthStore } from './authStore';
import { connect } from 'src/services/socketService'; // Renamed connectSocket to connect
import { AxiosError } from 'axios';
import type { Socket } from 'socket.io-client';

export const useHouseholdMemberStore = defineStore('householdMembers', () => {
  const $q = useQuasar();
  const authStore = useAuthStore();
  const members = ref<HouseholdMember[]>([]);
  let storeSocket: Socket | null = null; // Renamed to avoid confusion

  const loadMembers = async () => {
    if (!authStore.isAuthenticated) {
      console.log('[HouseholdMemberStore] User not authenticated, skipping member load.');
      members.value = [];
      return;
    }
    try {
      console.log('[HouseholdMemberStore] Loading household members from API...');
      const fetchedMembers = await fetchHouseholdMembersAPI();
      members.value = fetchedMembers.sort((a, b) => (a.order ?? Infinity) - (b.order ?? Infinity) || a.name.localeCompare(b.name));
      console.log('[HouseholdMemberStore] Household members loaded:', members.value.length);
    } catch (error) {
      console.error('Failed to load household members:', error);
      $q.notify({
        color: 'negative',
        message: 'Không thể tải danh sách thành viên.',
        icon: 'report_problem',
      });
    }
  };

  const addMember = async (memberData: CreateHouseholdMemberPayload) => {
    if (!authStore.isAuthenticated) {
      $q.notify({ type: 'negative', message: 'Lỗi người dùng, không thể thêm thành viên.' });
      throw new Error('User not authenticated');
    }
    try {
      const payload: CreateHouseholdMemberPayload = {
        ...memberData,
        isActive: memberData.isActive ?? true,
      };
      const addedMember = await addHouseholdMemberAPI(payload);
      $q.notify({ type: 'positive', message: 'Đã thêm thành viên mới.' });
      return addedMember; // Return for potential immediate use
    } catch (error) {
      console.error('Failed to add household member:', error);
      $q.notify({
        color: 'negative',
        message: 'Thêm thành viên thất bại.',
        icon: 'report_problem',
      });
      throw error;
    }
  };

  const updateMember = async (id: string, updates: UpdateHouseholdMemberPayload) => {
    if (!authStore.isAuthenticated) {
      $q.notify({ type: 'negative', message: 'Lỗi người dùng, không thể cập nhật thành viên.' });
      throw new Error('User not authenticated');
    }
    try {
      // Sanitize payload: remove backend-managed fields
      // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
      const { id: _id, userId: _userId, createdAt: _createdAt, updatedAt: _updatedAt, ...payloadForApi } = updates as any;

      console.log(`[HouseholdMemberStore] Updating member ${id} with payload:`, JSON.parse(JSON.stringify(payloadForApi)));
      const updatedMember = await updateHouseholdMemberAPI(id, payloadForApi);
      $q.notify({ type: 'positive', message: 'Đã cập nhật thông tin thành viên.' });
      return updatedMember;
    } catch (error) {
      console.error('Failed to update household member:', error);
      $q.notify({
        color: 'negative',
        message: 'Cập nhật thành viên thất bại.',
        icon: 'report_problem',
      });
      throw error;
    }
  };

  const deleteMember = async (id: string) => {
    if (!authStore.isAuthenticated) {
      $q.notify({ type: 'negative', message: 'Lỗi người dùng, không thể xóa thành viên.' });
      throw new Error('User not authenticated');
    }
    try {
      await deleteHouseholdMemberAPI(id);
      $q.notify({ type: 'positive', message: 'Đã xóa thành viên.' });
    } catch (error) {
      console.error('Failed to delete household member:', error);
      let errorMessage = 'Xóa thành viên thất bại.';
      if (error instanceof AxiosError && error.response?.data?.message) {
        errorMessage = String(error.response.data.message);
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      $q.notify({
        color: 'negative',
        message: errorMessage,
        icon: 'report_problem',
      });
      throw error;
    }
  };

  const getMemberById = (id: string): HouseholdMember | undefined => {
    return members.value.find((m) => m.id === id);
  };

  const reorderMember = async (memberId: string, direction: 'up' | 'down') => {
    if (!authStore.isAuthenticated) {
      $q.notify({ type: 'negative', message: 'Lỗi người dùng, không thể sắp xếp thành viên.' });
      return;
    }

    const member = getMemberById(memberId);
    if (!member) {
      console.error('[HouseholdMemberStore] Reorder: Member not found');
      return;
    }

    // Filter active members and sort by current order to find siblings
    const siblings = members.value
      .filter(m => m.isActive) // Only reorder active members among themselves
      .sort((a, b) => (a.order ?? Infinity) - (b.order ?? Infinity) || a.name.localeCompare(b.name));

    const currentIndexInSiblings = siblings.findIndex(s => s.id === memberId);

    if (direction === 'up' && currentIndexInSiblings > 0) {
      const prevSibling = siblings[currentIndexInSiblings - 1];
      if (prevSibling) {
        // Swap orders
        const currentOrder = member.order ?? siblings.length; // Use a high order if null
        const prevOrder = prevSibling.order ?? siblings.length;
        await updateMember(member.id, { order: prevOrder });
        await updateMember(prevSibling.id, { order: currentOrder });
      }
    } else if (direction === 'down' && currentIndexInSiblings < siblings.length - 1) {
      const nextSibling = siblings[currentIndexInSiblings + 1];
      if (nextSibling) {
        // Swap orders
        const currentOrder = member.order ?? siblings.length;
        const nextOrder = nextSibling.order ?? siblings.length;
        await updateMember(member.id, { order: nextOrder });
        await updateMember(nextSibling.id, { order: currentOrder });
      }
    } // else: Cannot move further, no notification needed as per category store
  };

  // --- WebSocket Event Handling ---
  const handleHouseholdMemberUpdate = (data: { operation: string; item?: HouseholdMember; itemId?: string }) => {
    console.log('[HouseholdMemberStore] RAW handleHouseholdMemberUpdate invoked with data:', JSON.parse(JSON.stringify(data)));
    let changed = false;
    switch (data.operation) {
      case 'create':
        if (data.item) {
          console.log('[HouseholdMemberStore] Create operation. Item:', data.item);
          const exists = members.value.some(m => m.id === data.item!.id);
          if (exists) {
            console.warn('[HouseholdMemberStore] Create event: Member already exists in local store. ID:', data.item.id);
          }
          if (!exists) {
            members.value.push(data.item);
            changed = true;
          }
        }
        break;
      case 'update':
        if (data.item) {
          console.log('[HouseholdMemberStore] Update operation. Item:', data.item);
          const index = members.value.findIndex(m => m.id === data.item!.id);
          if (index !== -1) {
            members.value.splice(index, 1, data.item);
            changed = true;
          } else {
            // This case might happen if the client was offline when the item was created,
            // and then receives an update event for an item it doesn't know about.
            console.warn('[HouseholdMemberStore] Update event: Member not found locally, adding. ID:', data.item.id);
            members.value.push(data.item); // If not found, might be new for this client
            changed = true;
          }
        }
        break;
      case 'delete':
        if (data.itemId) {
          const initialLength = members.value.length;
          console.log('[HouseholdMemberStore] Delete operation. ItemID:', data.itemId);
          members.value = members.value.filter(m => m.id !== data.itemId);
          if (members.value.length !== initialLength) {
            changed = true;
          }
        }
        break;
      default:
        console.warn('[HouseholdMemberStore] Unknown operation from WebSocket:', data.operation);
    }
    if (changed) {
      members.value.sort((a, b) => (a.order ?? Infinity) - (b.order ?? Infinity) || a.name.localeCompare(b.name));
      console.log('[HouseholdMemberStore] Member list updated and sorted. New length:', members.value.length);
    } else {
      console.log('[HouseholdMemberStore] No change made to local members list by this event.');
    }
  };

  const setupSocketListeners = async () => {
    if (authStore.isAuthenticated) {
      try {
        console.log(`[HouseholdMemberStore] Attempting to connect socket and set up listeners.`);
        const connectedSocketInstance = await connect(); // Use the new async connect

        if (connectedSocketInstance?.connected) {
          storeSocket = connectedSocketInstance;
          console.log(`[HouseholdMemberStore] Socket connected (${storeSocket.id}). Setting up WebSocket listeners for household_members_updated`);
          storeSocket.off('household_members_updated', handleHouseholdMemberUpdate); // Remove old listener first
          storeSocket.on('household_members_updated', handleHouseholdMemberUpdate);
        } else {
          console.warn('[HouseholdMemberStore] Failed to connect socket or socket not connected after attempt. Listeners not set up.');
          if (storeSocket) { // If there was an old storeSocket, clean its listeners
              storeSocket.off('household_members_updated', handleHouseholdMemberUpdate);
              storeSocket = null;
          }
        }
      } catch (error) {
        console.error('[HouseholdMemberStore] Error during socket connection or listener setup:', error);
        if (storeSocket) {
          storeSocket.off('household_members_updated', handleHouseholdMemberUpdate);
          storeSocket = null;
        }
      }
    }
  };

  const clearSocketListeners = () => {
    if (storeSocket) {
      console.log(`[HouseholdMemberStore] Clearing WebSocket listeners for household_members_updated from socket ${storeSocket.id}`);
      storeSocket.off('household_members_updated', handleHouseholdMemberUpdate);
    }
    storeSocket = null; // Reset socket reference for this store
  };

  const initializeStore = () => {
    if (authStore.isAuthenticated) {
      void loadMembers();
      void setupSocketListeners();
    } else {
      members.value = [];
      clearSocketListeners();
    }
  };

  authStore.$subscribe(() => {
    initializeStore();
  });

  initializeStore();

  return {
    members,
    loadMembers,
    addMember,
    updateMember,
    deleteMember,
    getMemberById,
    reorderMember, // <-- Add this line
  };
});
