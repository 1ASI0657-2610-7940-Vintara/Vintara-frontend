import {BaseApi} from "../../shared/infrastructure/base-api.js";
import {BaseEndpoint} from "../../shared/infrastructure/base-endpoint.js";

const profilesEndpointPath = import.meta.env.VITE_PROFILES_ENDPOINT_PATH;

/**
 * Profiles API class to interact with the profile's endpoint.
 * @extends BaseApi
 */
export class ProfilesApi extends BaseApi {
    #profilesEndpoint;

    constructor() {
        super();
        this.#profilesEndpoint = new BaseEndpoint(this, profilesEndpointPath);
    }

    /**
     * Get all profiles (companies/employees).
     * @returns {Promise} The response containing the list of profiles.
     */
    getProfiles() {
        return this.#profilesEndpoint.getAll();
    }

    /**
     * Get a specific profile by ID.
     * @param {number|string} id The profile identifier.
     * @returns {Promise} The response containing the profile data.
     */
    getProfileById(id) {
        return this.#profilesEndpoint.getById(id);
    }

    /**
     * Create a new profile.
     * @param {Object} resource The profile data payload (DTO).
     * @returns {Promise} The response containing the created profile.
     */
    createProfile(resource) {
        return this.#profilesEndpoint.create(resource);
    }

}