import axios from 'axios';
import whatsappConfig from '../config/whatsapp.js';
import Notification from '../models/Notification.js';

class WhatsAppService {
  constructor() {
    this.baseUrl = `${whatsappConfig.baseUrl}/${whatsappConfig.apiVersion}/${whatsappConfig.phoneNumberId}`;
    this.headers = {
      'Authorization': `Bearer ${whatsappConfig.accessToken}`,
      'Content-Type': 'application/json'
    };
  }

  /**
   * Send a template message
   */
  async sendTemplateMessage(to, templateName, components = []) {
    try {
      const payload = {
        messaging_product: 'whatsapp',
        to: to.replace(/\D/g, ''), // Remove non-numeric characters
        type: 'template',
        template: {
          name: templateName,
          language: {
            code: 'en'
          },
          components
        }
      };

      const response = await axios.post(
        `${this.baseUrl}/messages`,
        payload,
        { headers: this.headers }
      );

      return {
        success: true,
        messageId: response.data.messages[0].id,
        data: response.data
      };
    } catch (error) {
      console.error('WhatsApp send error:', error.response?.data || error.message);
      return {
        success: false,
        error: {
          code: error.response?.data?.error?.code || 'SEND_ERROR',
          message: error.response?.data?.error?.message || error.message
        }
      };
    }
  }

  /**
   * Send booking confirmation
   */
  async sendBookingConfirmation(booking) {
    try {
      const components = [
        {
          type: 'body',
          parameters: [
            { type: 'text', text: booking.user.name },
            { type: 'text', text: booking.bookingId },
            { type: 'text', text: booking.studio.name },
            { type: 'text', text: new Date(booking.date).toLocaleDateString('en-IN') },
            { type: 'text', text: booking.timeSlot.startTime12h },
            { type: 'text', text: booking.timeSlot.endTime12h },
            { type: 'text', text: `₹${booking.pricing.totalAmount}` }
          ]
        }
      ];

      const result = await this.sendTemplateMessage(
        booking.user.phone,
        whatsappConfig.templates.bookingConfirmation,
        components
      );

      // Log notification
      await Notification.logNotification({
        booking: booking._id,
        user: booking.user._id,
        type: 'confirmation',
        channel: 'whatsapp',
        recipient: { phone: booking.user.phone },
        status: result.success ? 'sent' : 'failed',
        messageId: result.messageId,
        payload: components,
        error: result.error,
        sentAt: result.success ? new Date() : null,
        metadata: {
          templateName: whatsappConfig.templates.bookingConfirmation
        }
      });

      return result;
    } catch (error) {
      console.error('Send confirmation error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send reminder
   */
  async sendReminder(booking, reminderType) {
    try {
      const templateMap = {
        '12h': whatsappConfig.templates.reminder12h,
        '6h': whatsappConfig.templates.reminder6h,
        '3h': whatsappConfig.templates.reminder3h
      };

      const components = [
        {
          type: 'body',
          parameters: [
            { type: 'text', text: booking.user.name },
            { type: 'text', text: booking.studio.name },
            { type: 'text', text: new Date(booking.date).toLocaleDateString('en-IN') },
            { type: 'text', text: booking.timeSlot.startTime12h }
          ]
        }
      ];

      const result = await this.sendTemplateMessage(
        booking.user.phone,
        templateMap[reminderType],
        components
      );

      // Log notification
      await Notification.logNotification({
        booking: booking._id,
        user: booking.user._id,
        type: `reminder-${reminderType}`,
        channel: 'whatsapp',
        recipient: { phone: booking.user.phone },
        status: result.success ? 'sent' : 'failed',
        messageId: result.messageId,
        payload: components,
        error: result.error,
        sentAt: result.success ? new Date() : null,
        metadata: {
          templateName: templateMap[reminderType]
        }
      });

      return result;
    } catch (error) {
      console.error('Send reminder error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send cancellation notification
   */
  async sendCancellation(booking) {
    try {
      const components = [
        {
          type: 'body',
          parameters: [
            { type: 'text', text: booking.user.name },
            { type: 'text', text: booking.bookingId },
            { type: 'text', text: booking.studio.name },
            { type: 'text', text: new Date(booking.date).toLocaleDateString('en-IN') },
            { type: 'text', text: booking.timeSlot.startTime12h }
          ]
        }
      ];

      if (booking.cancellation?.penaltyAmount > 0) {
        components[0].parameters.push({
          type: 'text',
          text: `₹${booking.cancellation.penaltyAmount}`
        });
      }

      const result = await this.sendTemplateMessage(
        booking.user.phone,
        whatsappConfig.templates.cancellation,
        components
      );

      // Log notification
      await Notification.logNotification({
        booking: booking._id,
        user: booking.user._id,
        type: 'cancellation',
        channel: 'whatsapp',
        recipient: { phone: booking.user.phone },
        status: result.success ? 'sent' : 'failed',
        messageId: result.messageId,
        payload: components,
        error: result.error,
        sentAt: result.success ? new Date() : null,
        metadata: {
          templateName: whatsappConfig.templates.cancellation
        }
      });

      return result;
    } catch (error) {
      console.error('Send cancellation error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send reschedule notification
   */
  async sendReschedule(booking, oldDate, oldTime) {
    try {
      const components = [
        {
          type: 'body',
          parameters: [
            { type: 'text', text: booking.user.name },
            { type: 'text', text: booking.bookingId },
            { type: 'text', text: new Date(oldDate).toLocaleDateString('en-IN') },
            { type: 'text', text: oldTime },
            { type: 'text', text: new Date(booking.date).toLocaleDateString('en-IN') },
            { type: 'text', text: booking.timeSlot.startTime12h }
          ]
        }
      ];

      const result = await this.sendTemplateMessage(
        booking.user.phone,
        whatsappConfig.templates.reschedule,
        components
      );

      // Log notification
      await Notification.logNotification({
        booking: booking._id,
        user: booking.user._id,
        type: 'reschedule',
        channel: 'whatsapp',
        recipient: { phone: booking.user.phone },
        status: result.success ? 'sent' : 'failed',
        messageId: result.messageId,
        payload: components,
        error: result.error,
        sentAt: result.success ? new Date() : null,
        metadata: {
          templateName: whatsappConfig.templates.reschedule
        }
      });

      return result;
    } catch (error) {
      console.error('Send reschedule error:', error);
      return { success: false, error: error.message };
    }
  }
}

export default new WhatsAppService();