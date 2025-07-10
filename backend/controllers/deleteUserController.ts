import {Request} from "express";
import {getCluster} from "../db/couchbase.js";
import {QueryScanConsistency} from "couchbase"; 

const bucketName = "appian";
const scopeName = "user";
const collectionName = "document";
const aadhaar = "aadhaar";
const pan = "pan";
const creditcard = "creditcard";
const cheque = "cheque";

export const deleteUser = async (req: Request): Promise<{status: number, body: any}> => {
    try{
        const {name} = req.query;
    
        if(!name) 
            return {status: 400, body: { error: "Name is required" }};

        const cluster = getCluster();
        const query1 = `SELECT document_type FROM \`${bucketName}\`.\`${scopeName}\`.\`${collectionName}\` WHERE name=$name`;

        const docs = await cluster.query(query1, {parameters: {name}, scanConsistency: QueryScanConsistency.RequestPlus});
        // console.log(docs.rows);

        for(const doc of docs.rows){
            switch(doc){
                case "Aadhaar Card":
                    const queryAadhaar = `DELETE FROM \`${bucketName}\`.\`${scopeName}\`.\`${aadhaar}\` WHERE name=$name`;
                    await cluster.query(queryAadhaar, {parameters: {name}, scanConsistency: QueryScanConsistency.RequestPlus});
                    break;

                case "PAN Card":
                    const queryPan = `DELETE FROM \`${bucketName}\`.\`${scopeName}\`.\`${pan}\` WHERE name=$name`;
                    await cluster.query(queryPan, {parameters: {name}, scanConsistency: QueryScanConsistency.RequestPlus});
                    break;

                case "Credit Card":
                    const queryCreditCard = `DELETE FROM \`${bucketName}\`.\`${scopeName}\`.\`${collectionName}\` WHERE name=$name`;
                    await cluster.query(queryCreditCard, {parameters: {name}, scanConsistency: QueryScanConsistency.RequestPlus});
                    break;

                case "Cheque":
                    const queryCheque = `DELETE FROM \`${bucketName}\`.\`${scopeName}\`.\`${cheque}\` WHERE name=$name`;
                    await cluster.query(queryCheque, {parameters: {name}, scanConsistency: QueryScanConsistency.RequestPlus});
                    break;
            }
        }

        // deleting user from the document collection
        const query2 = `DELETE FROM \`${bucketName}\`.\`${scopeName}\`.\`${collectionName}\` WHERE name=$name`;

        await cluster.query(query2, {parameters: {name}, scanConsistency: QueryScanConsistency.RequestPlus});
        return {status: 200, body: { message: "User deleted successfully" }};
    }
    catch (error) {
        console.error("Error deleting user:", error);
        return {status: 500, body: { error: "Failed to delete user details" }};
    }
}; 