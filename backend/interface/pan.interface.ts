export interface Pan{
    name: string;
    fileLink: {
        iv: string;
        ciphertext: string;
    };
    createdAt?: string;
    updatedAt?: string;
}