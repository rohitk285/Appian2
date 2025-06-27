import crypto from "crypto";
import dotenv from "dotenv";
dotenv.config();

export interface EncryptedData {
  iv: string;
  ciphertext: string;
}

export function encryptAES(plaintext: string): EncryptedData {
  const keyHex = process.env.ENCRYPTION_KEY;
  if (!keyHex) {
    throw new Error("ENCRYPTION_KEY not set in environment variables");
  }

  const key = Buffer.from(keyHex, "hex");
  const iv = crypto.randomBytes(16); // Always 16 bytes for AES-CBC

  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final()
  ]);

  return {
    iv: iv.toString("hex"),
    ciphertext: encrypted.toString("hex"),
  };
}

export function hashName(name: string): string {
  return crypto.createHash("sha256").update(name).digest("hex");
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
  const decrypted = Buffer.concat([decipher.update(encryptedText), decipher.final()]);

  // Convert directly to UTF-8 (works if encryption used PKCS7 padding)
  return decrypted.toString("utf8");
}
