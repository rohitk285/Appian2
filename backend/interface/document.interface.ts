export interface Document{
    name: string;
    document_type: string[];
    named_entities: Record<string, {iv: string, ciphertext: string}>;
    createdAt?: string;
    updatedAt?: string;
}