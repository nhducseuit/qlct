import { defineStore } from 'pinia';
import { ref, computed, type Ref } from 'vue';
import { getFamilies, createFamily } from '../services/familyApiService';
import type { Family } from '../models/family';
import { useAuthStore } from './authStore';

export const useFamilyStore = defineStore('family', () => {
  const authStore = useAuthStore();
  const families: Ref<Family[]> = ref([]);
  const selectedFamilyId = ref<string | null>(authStore.user?.familyId || null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const selectedFamily = computed(() =>
    families.value.find((f: Family) => f.id === selectedFamilyId.value) || null
  );

  const parentOfSelectedFamily = computed(() => {
    const current = selectedFamily.value;
    if (!current || !current.parentId) {
      return null;
    }
    return families.value.find((f) => f.id === current.parentId) || null;
  });

  async function loadFamilies() {
    loading.value = true;
    error.value = null;
    try {
      const data = await getFamilies();
      families.value = data;

      const userFamilyInList = data.some(f => f.id === authStore.user?.familyId);

      // If selectedFamilyId is not set, or if the currently selected one is not in the fetched list
      if (!selectedFamilyId.value || !families.value.some(f => f.id === selectedFamilyId.value)) {
         if (authStore.user?.familyId && userFamilyInList) {
            // Prioritize the user's actual family ID from the auth token
            selectedFamilyId.value = authStore.user.familyId;
         } else if (data.length > 0 && data[0]?.id) {
            // Fallback to the first family in the list as a last resort
            selectedFamilyId.value = data[0].id;
         }
      }
    } catch (e) {
      error.value = (e instanceof Error && e.message) ? e.message : 'Failed to fetch families';
    } finally {
      loading.value = false;
    }
  }

  function selectFamily(id: string) {
    selectedFamilyId.value = id;
  }

  async function addFamily(payload: { name: string }) {
    loading.value = true;
    error.value = null;
    try {
      const newFamily = await createFamily(payload);
      families.value.push(newFamily);
      selectedFamilyId.value = newFamily.id;
    } catch (e) {
      error.value = (e instanceof Error && e.message) ? e.message : 'Failed to create family';
    } finally {
      loading.value = false;
    }
  }

  return {
    families,
    selectedFamilyId,
    selectedFamily,
    loading,
    error,
    loadFamilies,
    selectFamily,
    addFamily,
    parentOfSelectedFamily,
  };
});
