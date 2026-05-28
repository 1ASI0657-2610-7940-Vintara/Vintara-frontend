export class Profile {
    constructor({ id = 0, fullName = '', address = '', phone = '', taxIdentity = '' }) {
        this.id = id;
        this.fullName = fullName;
        this.address = address;
        this.phone = phone;
        this.taxIdentity = taxIdentity;
    }
}