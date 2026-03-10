import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
const apiVersion = process.env.WHATSAPP_API_VERSION || 'v21.0';

class WhatsappService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = `https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`;
    if (!accessToken || !phoneNumberId) {
      console.warn('⚠️ Meta WhatsApp API credentials not found. WhatsApp messages will not be sent.');
    }
  }

  /**
   * Sends a WhatsApp message using Meta Cloud API
   * Note: Free-form text messages can only be sent within 24h of a user's message.
   * For proactive messages (reminders/invitations), you should use templates.
   */
  async sendMessage(to: string, body: string) {
    // If no credentials, simulate
    if (!accessToken || !phoneNumberId || accessToken === 'your_meta_access_token_here') {
      console.log('--- Simulated WhatsApp Meta Message ---');
      console.log(`To: ${to}`);
      console.log(`Body: ${body}`);
      console.log('--------------------------------------');
      return { id: `SIM_META_${Date.now()}`, status: 'simulated' };
    }

    try {
      // Remove any non-digit characters from the phone number
      const formattedTo = to.replace(/\D/g, '');

      const response = await axios.post(
        this.baseUrl,
        {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: formattedTo,
          type: 'text',
          text: {
            body: body,
          },
        },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return {
        id: response.data.messages[0].id,
        status: 'sent',
        raw: response.data
      };
    } catch (error: any) {
      console.error('Error sending Meta WhatsApp message:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Send a template message (REQUIRED for proactive notifications)
   */
  async sendTemplateMessage(to: string, templateName: string, languageCode: string = 'en_us', components: any[] = []) {
    if (!accessToken || !phoneNumberId || accessToken === 'your_meta_access_token_here') {
      console.log(`--- Simulated Meta Template [${templateName}] to ${to} ---`);
      return { id: `SIM_TMPL_${Date.now()}`, status: 'simulated' };
    }

    try {
      const formattedTo = to.replace(/\D/g, '');
      console.log(`📡 Sending Meta Template [${templateName}] in ${languageCode} to ${formattedTo}...`);

      const response = await axios.post(
        this.baseUrl,
        {
          messaging_product: 'whatsapp',
          to: formattedTo,
          type: 'template',
          template: {
            name: templateName,
            language: {
              code: languageCode,
            },
            components: components
          },
        },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return {
        id: response.data.messages[0].id,
        status: 'sent',
      };
    } catch (error: any) {
      const metaError = error.response?.data?.error;
      const errorMessage = metaError
        ? `[Meta Error ${metaError.code}]: ${metaError.message}`
        : error.message;

      console.error('❌ Meta API Fail:', JSON.stringify(error.response?.data || error.message, null, 2));
      throw new Error(errorMessage);
    }
  }
}

export default new WhatsappService();
