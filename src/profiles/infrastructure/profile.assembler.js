import {Profile} from "../domain/model/profile.entity.js";

/**
 * ProfileAssembler
 * Converts profile resources/responses into Profile domain entities and vice versa.
 * @class
 */
export class ProfileAssembler {
    /**
     * Converts a single profile resource (DTO) into a Profile entity.
     * Maps backend naming (companyName) to frontend naming (businessName).
     * @param {Object} resource - The profile resource object from API.
     * @returns {Profile} - The converted Profile entity.
     */
    static toEntityFromResource(resource) {
        return new Profile({
            id: resource.id,
            fullName: resource.fullName,
            address: resource.address,
            phone: resource.phone,
            taxIdentity: resource.taxIdentity
        });
    }

    /**
     * Converts an API response containing multiple profile resources into Profile entities.
     * Handles status checks and array extraction internally.
     * @param {Object} response - The response object containing profile data.
     * @returns {Profile[]} - Array of Profile entities.
     */
    static toEntitiesFromResponse(response) {
        if (response.status !== 200 && response.status !== 201) {
            console.error(`Error in ProfileAssembler: ${response.status}: ${response.statusText}`);
            return [];
        }

        const resources = Array.isArray(response.data)
            ? response.data
            : [];

        return resources.map(resource => this.toEntityFromResource(resource));
    }

    /**
     * Converts a Profile entity into a resource object (DTO) for API requests.
     * Essential for Create/Update operations to match backend-expected fields.
     * @returns {Object} - The resource object ready to be sent.
     * @param formModel
     */
    static toResourceFromEntity(formModel) {
        return {
            businessName: formModel.businessName,
            branch: formModel.branch,
            street: formModel.street,
            number: formModel.number,
            city: formModel.city,
            postalCode: formModel.postalCode,
            country: formModel.country,
            phone: formModel.phone,
            legalId: formModel.legalId
        };
    }
}