import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { ProfilesApi } from "../infrastructure/profiles-api.js";
import { ProfileAssembler } from "../infrastructure/profile.assembler.js";

const profilesApi = new ProfilesApi();

export const useProfileStore = defineStore("profile", () => {
    const profiles = ref([]);
    const loading = ref(false);
    const error = ref(null);

    const profilesCount = computed(() => profiles.value.length);

    async function fetchProfiles() {
        loading.value = true;
        try {
            const response = await profilesApi.getProfiles();
            profiles.value = ProfileAssembler.toEntitiesFromResponse(response);
        } catch (e) {
            error.value = e;
            console.error(e);
        } finally {
            loading.value = false;
        }
    }

    async function createProfile(profileData) {
        loading.value = true;
        try {
            const resource = ProfileAssembler.toResourceFromEntity(profileData);
            const response = await profilesApi.createProfile(resource);
            const newEntity = ProfileAssembler.toEntityFromResource(response.data);
            profiles.value.push(newEntity);
            return true;
        } catch (e) {
            error.value = e;
            console.error(e);
            return false;
        } finally {
            loading.value = false;
        }
    }

    return {
        profiles,
        loading,
        error,
        profilesCount,
        fetchProfiles,
        createProfile
    };
});

export default useProfileStore;