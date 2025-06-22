import { Request } from "express";
import { getCluster } from "../db/couchbase.js";
import { decryptAES, EncryptedData } from "../utils/encryptionUtils.js";
import { QueryScanConsistency } from "couchbase";

const bucketName = "appian";
const scopeName = "user";
const collectionName = "document";

export const getUserDetails = async (req: Request): Promise<{status: number, body: any}> => {
    try{
        const {name} = req.query;
        if(!name) return {status: 400, body: { error: "Name is required" }};
        
        const cluster = getCluster();

        const query = `
            SELECT META().id, name, document_type, named_entities, createdAt, updatedAt
            FROM \`${bucketName}\`.\`${scopeName}\`.\`${collectionName}\`
            WHERE LOWER(name) LIKE LOWER($name)
            `;
        // console.log(query);
        const userDocuments = await cluster.query(query, {parameters:  { name: `%${name}%` }, scanConsistency: QueryScanConsistency.RequestPlus});

        const decryptedDocuments = userDocuments.rows.map((doc:any) => {
            const decryptedNamedEntities: Record<string, string|null> = {};
            for (const [key, value] of Object.entries(doc.named_entities || {})) {
                try {
                    decryptedNamedEntities[key] = decryptAES(value as EncryptedData);
                    //interface Encrypted data used for defining the type (iv, ciphertext) used for value variable
                } catch (e) {
                    decryptedNamedEntities[key] = null;
                }
            }
            return {
            ...doc,
            named_entities: decryptedNamedEntities,
            };
        });
        return {status: 200, body: {message: "User details fetched successfully", data: decryptedDocuments}};
    }
    catch(err){
        console.error("Error fetching user details:", err);
        return {status: 500, body: { error: "Failed to fetch user details" }};
    }
};