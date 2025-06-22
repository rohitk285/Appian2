import { Request } from "express";
import { validateVerhoeff } from "../utils/verhoeffUtil.js";

export const validateAadhaar = async (req: Request): Promise<{status: number, body: any}> => {  // return type mentioned
    const { aadhaar_number } = req.body;
    const cleanAadhaarNumber: string = aadhaar_number.replace(/\s+/g, ""); //try for loop - removing spaces in aadhar number

    if (!aadhaar_number || typeof aadhaar_number !== "string") {
        return {status: 400, body: { error: "Aadhaar number is required and must be a string." }};
    }

    // check for verhoeff check sum
    if(cleanAadhaarNumber && cleanAadhaarNumber.length === 12 && validateVerhoeff(cleanAadhaarNumber)){
        return {status: 200, body:{message: "Aadhaar Number is valid."}};
    }
    else{
        return {status: 400, body:{error: "Invalid Aadhaar Number."}};
    }
};