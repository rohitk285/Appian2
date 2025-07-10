import {Request} from "express";
import {getCluster} from "../db/couchbase.js";
import {QueryScanConsistency} from "couchbase"; 

const bucketName = "appian";
const scopeName = "user";
const collectionName = "document";

export const deleteUser = async (req: Request): Promise<{status: number, body: any}> => {
    try{
        const {name} = req.query;
        if(!name) 
            return {status: 400, body: { error: "Name is required" }};

        const cluster = getCluster();
        const query = `DELETE FROM \`${bucketName}\`.\`${scopeName}\`.\`${collectionName}\` WHERE name=$name`;

        const result = await cluster.query(query, {parameters: {name}, scanConsistency: QueryScanConsistency.RequestPlus});
        return {status: 200, body: { message: "User deleted successfully", result }};
    }
    catch (error) {
        console.error("Error deleting user:", error);
        return {status: 500, body: { error: "Failed to delete user details" }};
    }
}; 