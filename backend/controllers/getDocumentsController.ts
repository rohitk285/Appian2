import { Request } from "express";
import { getCluster } from "../db/couchbase.js";
import { decryptAES, EncryptedData } from "../utils/encryptionUtils.js";
import { QueryScanConsistency } from "couchbase";

const bucketName = "appian";
const scopeName = "user";

export const getDocuments = async (req: Request) : Promise<{status: number, body: any}> => {
    try{
        const {name, documentType} = req.query;
        if(!name || !documentType) {
            return {status: 400, body: { error: "Name and document type are required" }};
        }
        const cluster = getCluster();

        const query = `SELECT * FROM \`${bucketName}\`.\`${scopeName}\`.\`${documentType}\`
                       WHERE LOWER(name) LIKE LOWER($name)`;

        const documents = await cluster.query(query, {parameters: { name: `%${name}%` }, scanConsistency: QueryScanConsistency.RequestPlus});

        for (const row of documents.rows) {
            const doc = row[documentType as string];

            if (doc?.fileLink && typeof doc.fileLink === "object" && doc.fileLink.iv && doc.fileLink.ciphertext) {
                try {
                    doc.fileLink = decryptAES(doc.fileLink as EncryptedData);
                } catch (err) {
                    console.warn(`Failed to decrypt fileLink for ${doc.name}`, err);
                    doc.fileLink = "Decryption failed";
                }
            }
        }

        let response: {name: string, fileLink: string, createdAt: string}[] = [];
        for(const row of documents.rows) {
            const doc = row[documentType as string];
            response.push(doc);
        }

        return {status: 200, body: response};
    }
    catch (err) {
        console.error("Error fetching documents:", err);
        return {status: 500, body: { error: "Failed to fetch user details" }};
    }
};
