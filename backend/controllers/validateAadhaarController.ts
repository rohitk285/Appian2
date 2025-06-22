import { Request } from "express";

export const validateAadhaar = async (req: Request): Promise<{status: number, body: any}> => {  // return type mentioned
    const {number} = req.body;
    const aadhar_number = number.replace(/\s+/g, ""); //try for loop - removing spaces in aadhar number

    // check for verhoeff check sum
    if(aadhar_number && aadhar_number.length === 12){
        return {status: 200, body:{message: "Aadhaar Number is valid."}};
    }
    else{
        return {status: 400, body:{error: "Invalid Aadhaar Number."}};
    }
};