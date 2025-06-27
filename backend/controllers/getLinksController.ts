import { Request } from "express";
import { getCluster } from "../db/couchbase.js";
import { decryptAES, EncryptedData } from "../utils/encryptionUtils.js";
import { QueryScanConsistency } from "couchbase";

const bucketName = "appian";
const scopeName = "user";
const collectionName = "document";
const aadhaar = "aadhaar";
const pan = "pan";
const creditcard = "creditcard";
const cheque = "cheque";

export const getLinks = async (req: Request): Promise<{status: number, body: any}> => {
    try{
        const {name} = req.query;
        if(!name) return {status: 400, body: { error: "Name is required" }};

        const cluster = getCluster();

        const query = `SELECT document_type FROM \`${bucketName}\`.\`${scopeName}\`.\`${collectionName}\` WHERE name=$name`;
    
        const docs = await cluster.query(query, {parameters: {name}, scanConsistency: QueryScanConsistency.RequestPlus});
        // docs = docs.document_type;

        if(!docs || docs.rows.length===0)
            return {status: 500, body: "No documents found"};

        const documentTypes: string[] = docs.rows[0].document_type;

        //defining type for reponse variable to be an array of {documents:...., link:.....}
        let response: {document: string, link: string}[] = [];

        for(const docType of documentTypes){
            switch(docType){
                case "Aadhaar Card":
                    const query1 = `SELECT fileLink from \`${bucketName}\`.\`${scopeName}\`.\`${aadhaar}\`
                        WHERE name=$name`;
                    // passing hashedName as parameters in the query call so it can be used with $ sign
                    const aadhaarLink = await cluster.query(query1, {parameters:{name}, scanConsistency: QueryScanConsistency.RequestPlus});
                    if(aadhaarLink.rows.length>0)
                        response.push({ document: "Aadhar", link: decryptAES(aadhaarLink.rows[0].fileLink as EncryptedData) });
                    break;

                case "PAN Card":
                    const query2 = `SELECT fileLink from \`${bucketName}\`.\`${scopeName}\`.\`${pan}\`
                        WHERE name=$name`;
                    const panLink = await cluster.query(query2, {parameters:{name}, scanConsistency: QueryScanConsistency.RequestPlus});
                    if(panLink.rows.length>0)
                        response.push({ document: "PAN Card", link: decryptAES(panLink.rows[0].fileLink as EncryptedData) });
                    break;

                case "Cheque":
                    const query3 = `SELECT fileLink from \`${bucketName}\`.\`${scopeName}\`.\`${cheque}\`
                        WHERE name=$name`;
                    const chequeLink = await cluster.query(query3, {parameters:{name}, scanConsistency: QueryScanConsistency.RequestPlus});
                    if(chequeLink.rows.length>0)
                        response.push({ document: "Cheque", link: decryptAES(chequeLink.rows[0].fileLink as EncryptedData) });
                    break;
                
                case "Credit Card":
                    const query4 = `SELECT fileLink from \`${bucketName}\`.\`${scopeName}\`.\`${creditcard}\`
                        WHERE name=$name`;
                    const creditCardLink = await cluster.query(query4, {parameters:{name}, scanConsistency: QueryScanConsistency.RequestPlus});
                    if(creditCardLink.rows.length>0)
                        response.push({document: "Credit Card", link: decryptAES(creditCardLink.rows[0].fileLink as EncryptedData) });
                    break;
                
                default:
                    break;
            }
        }
        // console.log(name, response);
        if(response.length === 0)
            return {status: 404, body: { message: "No document links found" }}; //No matching records found

        return {status: 200, body: response};
    }
    catch(err){
        console.error("Error fetching user details:", err);
        return {status: 500, body: {error: "Failed to fetch user details" }};
    }
};