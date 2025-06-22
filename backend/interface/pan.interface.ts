export interface Pan{
    name: {
        iv: string;
        ciphertext: string;
    };
    nameHash: string;
    fileLink: string;
    createdAt?: string;
    updatedAt?: string;
}