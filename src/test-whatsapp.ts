import whatsappService from './services/whatsapp.service';
import dotenv from 'dotenv';

dotenv.config();

async function test() {
  try {
    console.log('Testing WhatsApp Service (Template)...');
    // Using the default 'hello_world' template provided by Meta
    const result = await whatsappService.sendTemplateMessage(
      '21650123423', // Change this to your number if different
      'hello_world',
      'en_us'
    );
    console.log('Result:', result);
  } catch (error: any) {
    console.error('Error:', error.response?.data || error.message);
  }
}

test();
