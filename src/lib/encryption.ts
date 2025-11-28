import crypto from 'crypto';

// 从环境变量获取加密密钥，如果没有则使用默认值（生产环境必须设置）
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-32-char-key-change-me!!';
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const SALT_LENGTH = 64;
const TAG_LENGTH = 16;
const TAG_POSITION = SALT_LENGTH + IV_LENGTH;
const ENCRYPTED_POSITION = TAG_POSITION + TAG_LENGTH;

/**
 * 生成密钥
 */
function getKey(salt: Buffer): Buffer {
  return crypto.pbkdf2Sync(ENCRYPTION_KEY, salt, 100000, 32, 'sha512');
}

/**
 * 加密文本
 * @param text 要加密的文本
 * @returns 加密后的字符串（Base64 编码）
 */
export function encrypt(text: string): string {
  const salt = crypto.randomBytes(SALT_LENGTH);
  const iv = crypto.randomBytes(IV_LENGTH);
  const key = getKey(salt);

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([
    cipher.update(text, 'utf8'),
    cipher.final(),
  ]);

  const tag = cipher.getAuthTag();

  // 组合: salt + iv + tag + encrypted
  const result = Buffer.concat([salt, iv, tag, encrypted]);
  return result.toString('base64');
}

/**
 * 解密文本
 * @param encryptedData 加密的字符串（Base64 编码）
 * @returns 解密后的原始文本
 */
export function decrypt(encryptedData: string): string {
  const data = Buffer.from(encryptedData, 'base64');

  const salt = data.subarray(0, SALT_LENGTH);
  const iv = data.subarray(SALT_LENGTH, TAG_POSITION);
  const tag = data.subarray(TAG_POSITION, ENCRYPTED_POSITION);
  const encrypted = data.subarray(ENCRYPTED_POSITION);

  const key = getKey(salt);

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);

  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ]);

  return decrypted.toString('utf8');
}

/**
 * 测试加密解密功能
 */
export function testEncryption(): boolean {
  try {
    const testString = 'test-api-key-12345';
    const encrypted = encrypt(testString);
    const decrypted = decrypt(encrypted);
    return testString === decrypted;
  } catch (error) {
    console.error('Encryption test failed:', error);
    return false;
  }
}
