import * as crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;

export class CryptoUtil {
  static encrypt(value: string, secret: string) {
    const iv = crypto.randomBytes(IV_LENGTH);
    const key = crypto.createHash('sha256').update(secret).digest();

    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
    const authTag = cipher.getAuthTag();

    return Buffer.concat([iv, authTag, encrypted]).toString('base64');
  }


  static decrypt(value: string, secret: string) {
    if (!value) throw new Error('Empty encrypted value');
    if (!secret) throw new Error('Missing secret key');

    const raw = Buffer.from(value, 'base64');

    if (raw.length < 32) {
      throw new Error('Encrypted data is too short and does not contain IV + AuthTag');
    }

    const iv = raw.slice(0, 16);
    const authTag = raw.slice(16, 32);
    const encryptedText = raw.slice(32);

    const key = crypto.createHash('sha256').update(secret).digest();

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    const decrypted = Buffer.concat([
      decipher.update(encryptedText),
      decipher.final(),
    ]);

    return decrypted.toString('utf8');

  }
}
