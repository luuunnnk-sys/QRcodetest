import QRCode from 'qrcode';

export interface ParticipantData {
  id: string;
  firstName: string;
  lastName: string;
  company: string;
  email?: string;
}

export async function generateDeterministicId(
  firstName: string,
  lastName: string,
  email: string,
  eventSecretKey: string
): Promise<string> {
  const uniqueString = `${email.toLowerCase().trim()}|${firstName.trim()}|${lastName.trim()}`;
  const hash = await generateHMAC(uniqueString, eventSecretKey);
  return hash.substring(0, 32);
}

export async function generateSignedQRCode(
  data: ParticipantData,
  secretKey: string
): Promise<string> {
  const payload = JSON.stringify(data);

  const signature = await generateHMAC(payload, secretKey);

  const signedData = JSON.stringify({
    data: payload,
    signature,
  });

  return signedData;
}

export async function verifyQRCode(
  signedData: string,
  secretKey: string
): Promise<ParticipantData | null> {
  try {
    const parsed = JSON.parse(signedData);
    const { data, signature } = parsed;

    const expectedSignature = await generateHMAC(data, secretKey);

    if (signature !== expectedSignature) {
      return null;
    }

    return JSON.parse(data);
  } catch {
    return null;
  }
}

export async function generateQRCodeImage(data: string): Promise<string> {
  try {
    return await QRCode.toDataURL(data, {
      errorCorrectionLevel: 'H',
      margin: 2,
      width: 300,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });
  } catch (error) {
    throw new Error('Failed to generate QR code');
  }
}

async function generateHMAC(data: string, key: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(key);
  const dataBuffer = encoder.encode(data);

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', cryptoKey, dataBuffer);

  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}
