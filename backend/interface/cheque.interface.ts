export interface Cheque{
    name: {
        iv: string;
        ciphertext: string;
    };
    nameHash: string;
    fileLink: string;
    createdAt?: string;
    updatedAt?: string;
}