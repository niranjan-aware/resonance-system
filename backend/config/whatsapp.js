// WhatsApp Business API Configuration
export const whatsappConfig = {
  phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
  accessToken: process.env.WHATSAPP_ACCESS_TOKEN,
  apiVersion: 'v21.0',
  baseUrl: 'https://graph.facebook.com',
  
  // Message Templates (must be approved by Meta)
  templates: {
    bookingConfirmation: 'booking_confirmation',
    reminder12h: 'booking_reminder_12h',
    reminder6h: 'booking_reminder_6h',
    reminder3h: 'booking_reminder_3h',
    cancellation: 'booking_cancelled',
    reschedule: 'booking_rescheduled'
  },

  // Webhook configuration
  webhook: {
    verifyToken: process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || 'resonance_webhook_verify_token_2024'
  }
};

export default whatsappConfig;