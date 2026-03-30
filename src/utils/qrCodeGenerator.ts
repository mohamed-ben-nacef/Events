import QRCode from 'qrcode';

/**
 * Generates a QR code as a Data URL (base64 string)
 * @param text The text to encode in the QR code
 * @returns Promise<string> Data URL representing the QR code
 */
export const generateQRCode = async (text: string): Promise<string> => {
  try {
    const dataUrl = await QRCode.toDataURL(text, {
      errorCorrectionLevel: 'H', // High error correction
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });
    return dataUrl;
  } catch (err) {
    console.error('Error generating QR code:', err);
    throw new Error('Failed to generate QR code');
  }
};
