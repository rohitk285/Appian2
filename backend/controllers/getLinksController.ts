import { Request } from "express";
import { getCluster } from "../db/couchbase.js";
import { hashName } from "../utils/encryptionUtils.js";
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

        const hashedName = hashName(name as string);
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
                        WHERE name_hash=$hashedName`;
                    // passing hashedName as parameters in the query call so it can be used with $ sign
                    const aadhaarLink = await cluster.query(query1, {parameters:{hashedName}});
                    if(aadhaarLink.rows.length>0)
                        response.push({ document: "Aadhar", link: aadhaarLink.rows[0].fileLink });
                    break;
                case "PAN Card":
                    const query2 = `SELECT fileLink from \`${bucketName}\`.\`${scopeName}\`.\`${pan}\`
                        WHERE name_hash=$hashedName`;
                    const panLink = await cluster.query(query2, {parameters:{hashedName}});
                    if(panLink.rows.length>0)
                        response.push({ document: "PAN Card", link: panLink.rows[0].fileLink });
                    break;
                case "Cheque":
                    const query3 = `SELECT fileLink from \`${bucketName}\`.\`${scopeName}\`.\`${cheque}\`
                        WHERE name_hash=$hashedName`;
                    const chequeLink = await cluster.query(query3, {parameters:{hashedName}});
                    if(chequeLink.rows.length>0)
                        response.push({ document: "Cheque", link: chequeLink.rows[0].fileLink });
                    break;
                case "Credit Card":
                    const query4 = `SELECT fileLink from \`${bucketName}\`.\`${scopeName}\`.\`${creditcard}\`
                        WHERE name_hash=$hashedName`;
                    const creditCardLink = await cluster.query(query4, {parameters:{hashedName}, scanConsistency: QueryScanConsistency.RequestPlus});
                    if(creditCardLink.rows.length>0)
                        response.push({document: "Credit Card", link: creditCardLink.rows[0].fileLink});
                    break;
                default:
                    break;
            }
        }

        if(response.length === 0)
            return {status: 404, body: { message: "No document links found" }}; //No matching records found

        return {status: 200, body: response};
    }
    catch(err){
        console.error("Error fetching user details:", err);
        return {status: 500, body: {error: "Failed to fetch user details" }};
    }
};