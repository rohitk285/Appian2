import crypto from "crypto";
import dotenv from "dotenv";
dotenv.config();

export interface EncryptedData {
  iv: string;
  ciphertext: string;
}

export function encryptAES(plaintextName: string): EncryptedData {
  const keyHex = process.env.ENCRYPTION_KEY;
  if (!keyHex) {
    throw new Error("ENCRYPTION_KEY not set in environment variables");
  }

  const key = Buffer.from(keyHex, "hex");
  const iv = crypto.randomBytes(16);

  const blockSize = 16;
  const buffer = Buffer.from(plaintextName, "utf8");
  const padLen = blockSize - (buffer.length % blockSize);
  const padded = Buffer.concat([buffer, Buffer.alloc(padLen, padLen)]);

  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
  const encrypted = Buffer.concat([cipher.update(padded), cipher.final()]);

  return {
    iv: iv.toString("hex"),
    ciphertext: encrypted.toString("hex"),
  };
}

export function decryptAES(encryptedObj: EncryptedData): string {
  const keyHex = process.env.ENCRYPTION_KEY;
  if (!keyHex) {
    throw new Error("ENCRYPTION_KEY not set in environment variables");
  }

  const key = Buffer.from(keyHex, "hex");
  const iv = Buffer.from(encryptedObj.iv, "hex");
  const encryptedText = Buffer.from(encryptedObj.ciphertext, "hex");

  const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
  const decryptedPadded = Buffer.concat([decipher.update(encryptedText), decipher.final()]);

  // Remove PKCS#7 padding
  const padLen = decryptedPadded[decryptedPadded.length - 1];
  const decrypted = decryptedPadded.slice(0, decryptedPadded.length - padLen);

  return decrypted.toString("utf8");
}

export function hashName(name: string): string {
  return crypto.createHash("sha256").update(name).digest("hex");
}
