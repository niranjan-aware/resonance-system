import { google } from 'googleapis';
import { format } from 'date-fns';

// Studio to Calendar mapping - UPDATE THESE WITH YOUR CALENDAR IDs
const STUDIO_CALENDAR_MAP = {
  // Replace with your actual studio IDs and calendar IDs
  '68d601f4e5dd6677ff006f72': 'b5518c93fa1d3722f71e43401fe30aad214783e03d7d130edfadff90750e9119@group.calendar.google.com', 
  '68d601f4e5dd6677ff006f7d': '374fac8f6b4c4c43f2f93134fc34411ecb1fd24b1842554e05c49363c6f043c3@group.calendar.google.com',
  '68d601f4e5dd6677ff006f85': '24361c31736b587807fbd75f9d1451c60483beb62c5c5ad25ff03f8bda70a910@group.calendar.google.com'
};

const GOOGLE_SHEET_ID = '1DLoiRmOCAWYFNGpPcbn5cu2-oTuoWko67QAJXR8OQfo';
const SHEET_NAME = 'Resonance Bookings Master';

class GoogleIntegrationService {
  constructor() {
    // Check if Google credentials are configured
    if (!process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
      console.warn('⚠️  Google Service Account not configured. Google integration will be skipped.');
      this.isConfigured = false;
      return;
    }

    try {
      // Initialize Google Auth with service account
      const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
      
      this.auth = new google.auth.GoogleAuth({
        credentials,
        scopes: [
          'https://www.googleapis.com/auth/calendar',
          'https://www.googleapis.com/auth/spreadsheets'
        ]
      });

      this.calendar = google.calendar({ version: 'v3', auth: this.auth });
      this.sheets = google.sheets({ version: 'v4', auth: this.auth });
      this.isConfigured = true;
      
      console.log('✅ Google Integration initialized');
    } catch (error) {
      console.error('❌ Google Integration initialization failed:', error.message);
      this.isConfigured = false;
    }
  }

  /**
   * Add booking to Google Calendar
   */
  async addToCalendar(booking) {
    if (!this.isConfigured) {
      console.log('⚠️  Google Calendar: Skipped (not configured)');
      return null;
    }

    try {
      const calendarId = STUDIO_CALENDAR_MAP[booking.studio._id || booking.studio];
      
      if (!calendarId) {
        console.error('No calendar mapping found for studio:', booking.studio);
        return null;
      }

      // Create start and end datetime
      const bookingDate = new Date(booking.date);
      const [startHour, startMin] = booking.timeSlot.startTime.split(':');
      const [endHour, endMin] = booking.timeSlot.endTime.split(':');
      
      const startDateTime = new Date(bookingDate);
      startDateTime.setHours(parseInt(startHour), parseInt(startMin), 0);
      
      const endDateTime = new Date(bookingDate);
      endDateTime.setHours(parseInt(endHour), parseInt(endMin), 0);

      // Prepare event data
      const event = {
        summary: `${booking.sessionType.toUpperCase()} - ${booking.user.name}`,
        description: this.formatEventDescription(booking),
        start: {
          dateTime: startDateTime.toISOString(),
          timeZone: 'Asia/Kolkata'
        },
        end: {
          dateTime: endDateTime.toISOString(),
          timeZone: 'Asia/Kolkata'
        },
        colorId: this.getColorIdBySessionType(booking.sessionType),
        extendedProperties: {
          private: {
            bookingId: booking.bookingId || booking._id.toString(),
            userId: booking.user._id.toString(),
            studioId: booking.studio._id.toString()
          }
        },
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 24 * 60 }, // 1 day before
            { method: 'popup', minutes: 60 } // 1 hour before
          ]
        }
      };

      // Insert event into calendar
      const response = await this.calendar.events.insert({
        calendarId,
        resource: event,
        sendUpdates: 'all'
      });

      console.log('✅ Calendar event created:', response.data.id);
      return response.data;
    } catch (error) {
      console.error('❌ Error adding to calendar:', error.message);
      return null;
    }
  }

  /**
   * Update calendar event
   */
  async updateCalendarEvent(booking, calendarEventId) {
    if (!this.isConfigured) {
      console.log('⚠️  Google Calendar: Skipped (not configured)');
      return null;
    }

    try {
      const calendarId = STUDIO_CALENDAR_MAP[booking.studio._id || booking.studio];
      
      if (!calendarId || !calendarEventId) {
        console.error('Missing calendar ID or event ID');
        return null;
      }

      const bookingDate = new Date(booking.date);
      const [startHour, startMin] = booking.timeSlot.startTime.split(':');
      const [endHour, endMin] = booking.timeSlot.endTime.split(':');
      
      const startDateTime = new Date(bookingDate);
      startDateTime.setHours(parseInt(startHour), parseInt(startMin), 0);
      
      const endDateTime = new Date(bookingDate);
      endDateTime.setHours(parseInt(endHour), parseInt(endMin), 0);

      const event = {
        summary: `${booking.sessionType.toUpperCase()} - ${booking.user.name} [${booking.status.toUpperCase()}]`,
        description: this.formatEventDescription(booking),
        start: {
          dateTime: startDateTime.toISOString(),
          timeZone: 'Asia/Kolkata'
        },
        end: {
          dateTime: endDateTime.toISOString(),
          timeZone: 'Asia/Kolkata'
        },
        colorId: this.getColorIdByStatus(booking.status)
      };

      const response = await this.calendar.events.update({
        calendarId,
        eventId: calendarEventId,
        resource: event,
        sendUpdates: 'all'
      });

      console.log('✅ Calendar event updated:', response.data.id);
      return response.data;
    } catch (error) {
      console.error('❌ Error updating calendar event:', error.message);
      return null;
    }
  }

  /**
   * Delete calendar event
   */
  async deleteCalendarEvent(studioId, calendarEventId) {
    if (!this.isConfigured) {
      console.log('⚠️  Google Calendar: Skipped (not configured)');
      return null;
    }

    try {
      const calendarId = STUDIO_CALENDAR_MAP[studioId];
      
      if (!calendarId || !calendarEventId) {
        return null;
      }

      await this.calendar.events.delete({
        calendarId,
        eventId: calendarEventId,
        sendUpdates: 'all'
      });

      console.log('✅ Calendar event deleted:', calendarEventId);
      return true;
    } catch (error) {
      console.error('❌ Error deleting calendar event:', error.message);
      return null;
    }
  }

  /**
   * Add booking to Google Sheet
   */
  async addToSheet(booking) {
    if (!this.isConfigured) {
      console.log('⚠️  Google Sheets: Skipped (not configured)');
      return null;
    }

    try {
      // First, ensure the sheet exists
      await this.ensureSheetExists();
      
      // Prepare row data
      const rowData = [
        booking.bookingId,
        format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
        booking.user.name,
        booking.user.email || 'N/A',
        booking.user.phone || 'N/A',
        booking.studio.name,
        format(new Date(booking.date), 'yyyy-MM-dd'),
        booking.timeSlot.startTime,
        booking.timeSlot.endTime,
        booking.sessionType,
        booking.sessionDetails?.participants || booking.sessionDetails?.musicians || 'N/A',
        booking.pricing.baseAmount,
        booking.pricing.taxes,
        booking.pricing.totalAmount,
        booking.payment.status,
        booking.status,
        booking.sessionDetails?.specialRequirements || 'None'
      ];

      const range = `'${SHEET_NAME}'!A:Q`;

      await this.sheets.spreadsheets.values.append({
        spreadsheetId: GOOGLE_SHEET_ID,
        range: range,
        valueInputOption: 'RAW',
        insertDataOption: 'INSERT_ROWS',
        resource: {
          values: [rowData]
        }
      });

      console.log('✅ Booking added to Google Sheet');
      return true;
    } catch (error) {
      console.error('❌ Error adding to Google Sheet:', error.message);
      return null;
    }
  }

  /**
   * Ensure sheet tab exists
   */
  async ensureSheetExists() {
    if (!this.isConfigured) return;

    try {
      const spreadsheet = await this.sheets.spreadsheets.get({
        spreadsheetId: GOOGLE_SHEET_ID
      });

      const sheetExists = spreadsheet.data.sheets.some(
        sheet => sheet.properties.title === SHEET_NAME
      );

      if (!sheetExists) {
        console.log(`Sheet "${SHEET_NAME}" not found. Creating it...`);
        await this.initializeSheet();
      }
    } catch (error) {
      console.error('Error checking sheet existence:', error.message);
      await this.initializeSheet();
    }
  }

  /**
   * Update booking in Google Sheet
   */
  async updateSheetRow(booking) {
    if (!this.isConfigured) {
      console.log('⚠️  Google Sheets: Skipped (not configured)');
      return null;
    }

    try {
      const range = `'${SHEET_NAME}'!A:A`;
      
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: GOOGLE_SHEET_ID,
        range: range
      });

      const rows = response.data.values || [];
      const rowIndex = rows.findIndex(row => row[0] === booking.bookingId);

      if (rowIndex === -1) {
        console.log('Booking not found in sheet, adding new row');
        return await this.addToSheet(booking);
      }

      const rowNumber = rowIndex + 1;
      const rowData = [
        booking.bookingId,
        format(new Date(booking.createdAt), 'yyyy-MM-dd HH:mm:ss'),
        booking.user.name,
        booking.user.email || 'N/A',
        booking.user.phone || 'N/A',
        booking.studio.name,
        format(new Date(booking.date), 'yyyy-MM-dd'),
        booking.timeSlot.startTime,
        booking.timeSlot.endTime,
        booking.sessionType,
        booking.sessionDetails?.participants || booking.sessionDetails?.musicians || 'N/A',
        booking.pricing.baseAmount,
        booking.pricing.taxes,
        booking.pricing.totalAmount,
        booking.payment.status,
        booking.status,
        booking.sessionDetails?.specialRequirements || 'None'
      ];

      const updateRange = `'${SHEET_NAME}'!A${rowNumber}:Q${rowNumber}`;

      await this.sheets.spreadsheets.values.update({
        spreadsheetId: GOOGLE_SHEET_ID,
        range: updateRange,
        valueInputOption: 'RAW',
        resource: {
          values: [rowData]
        }
      });

      console.log('✅ Booking updated in Google Sheet');
      return true;
    } catch (error) {
      console.error('❌ Error updating Google Sheet:', error.message);
      return null;
    }
  }

  /**
   * Initialize Google Sheet with headers
   */
  async initializeSheet() {
    if (!this.isConfigured) return;

    try {
      const headers = [
        'Booking ID',
        'Created At',
        'Customer Name',
        'Email',
        'Phone',
        'Studio',
        'Date',
        'Start Time',
        'End Time',
        'Session Type',
        'Participants/Musicians',
        'Base Amount',
        'Taxes',
        'Total Amount',
        'Payment Status',
        'Booking Status',
        'Special Requirements'
      ];

      const spreadsheet = await this.sheets.spreadsheets.get({
        spreadsheetId: GOOGLE_SHEET_ID
      });

      const sheetExists = spreadsheet.data.sheets.some(
        sheet => sheet.properties.title === SHEET_NAME
      );

      let sheetId = 0;

      if (!sheetExists) {
        console.log(`Creating new sheet: "${SHEET_NAME}"`);
        const addSheetResponse = await this.sheets.spreadsheets.batchUpdate({
          spreadsheetId: GOOGLE_SHEET_ID,
          resource: {
            requests: [{
              addSheet: {
                properties: {
                  title: SHEET_NAME
                }
              }
            }]
          }
        });
        
        sheetId = addSheetResponse.data.replies[0].addSheet.properties.sheetId;
      } else {
        const existingSheet = spreadsheet.data.sheets.find(
          sheet => sheet.properties.title === SHEET_NAME
        );
        sheetId = existingSheet.properties.sheetId;
      }

      const headerRange = `'${SHEET_NAME}'!A1:Q1`;
      
      await this.sheets.spreadsheets.values.update({
        spreadsheetId: GOOGLE_SHEET_ID,
        range: headerRange,
        valueInputOption: 'RAW',
        resource: {
          values: [headers]
        }
      });

      await this.sheets.spreadsheets.batchUpdate({
        spreadsheetId: GOOGLE_SHEET_ID,
        resource: {
          requests: [{
            repeatCell: {
              range: {
                sheetId: sheetId,
                startRowIndex: 0,
                endRowIndex: 1
              },
              cell: {
                userEnteredFormat: {
                  backgroundColor: { red: 0.2, green: 0.4, blue: 0.8 },
                  textFormat: {
                    foregroundColor: { red: 1, green: 1, blue: 1 },
                    fontSize: 11,
                    bold: true
                  }
                }
              },
              fields: 'userEnteredFormat(backgroundColor,textFormat)'
            }
          }]
        }
      });

      console.log(`✅ Google Sheet "${SHEET_NAME}" initialized with sheet ID: ${sheetId}`);
      return true;
    } catch (error) {
      console.error('❌ Error initializing Google Sheet:', error.message);
      return null;
    }
  }

  /**
   * Helper: Format event description
   */
  formatEventDescription(booking) {
    return `
📅 Booking Details
━━━━━━━━━━━━━━━━━━━━
🎫 Booking ID: ${booking.bookingId}
👤 Customer: ${booking.user.name}
📧 Email: ${booking.user.email || 'N/A'}
📱 Phone: ${booking.user.phone || 'N/A'}

🎵 Session Details
━━━━━━━━━━━━━━━━━━━━
📍 Studio: ${booking.studio.name}
🎸 Type: ${booking.sessionType}
👥 Participants: ${booking.sessionDetails?.participants || booking.sessionDetails?.musicians || 'N/A'}
⏰ Duration: ${booking.timeSlot.startTime} - ${booking.timeSlot.endTime}

💰 Pricing
━━━━━━━━━━━━━━━━━━━━
Base: ₹${booking.pricing.baseAmount}
Taxes: ₹${booking.pricing.taxes}
Total: ₹${booking.pricing.totalAmount}

📝 Status: ${booking.status.toUpperCase()}
💳 Payment: ${booking.payment.status.toUpperCase()}

${booking.sessionDetails?.specialRequirements ? `\n📌 Special Requirements:\n${booking.sessionDetails.specialRequirements}` : ''}
    `.trim();
  }

  /**
   * Helper: Get color by session type
   */
  getColorIdBySessionType(sessionType) {
    const colorMap = {
      'karaoke': '9',
      'live-musicians': '10',
      'audio-recording': '11',
      'video-recording': '5',
      'fb-live': '4',
      'band': '6',
      'show': '7'
    };
    return colorMap[sessionType] || '1';
  }

  /**
   * Helper: Get color by booking status
   */
  getColorIdByStatus(status) {
    const colorMap = {
      'pending': '5',
      'confirmed': '10',
      'cancelled': '11',
      'completed': '9',
      'checked-in': '7',
      'no-show': '8'
    };
    return colorMap[status] || '1';
  }

  /**
   * Get calendar public URL
   */
  getCalendarPublicUrl(studioId) {
    const calendarId = STUDIO_CALENDAR_MAP[studioId];
    if (!calendarId) return null;
    
    return `https://calendar.google.com/calendar/embed?src=${encodeURIComponent(calendarId)}`;
  }

  /**
   * Get sheet public URL
   */
  getSheetPublicUrl() {
    return `https://docs.google.com/spreadsheets/d/${GOOGLE_SHEET_ID}/edit`;
  }
}

// Export as default - THIS WAS THE MISSING PART!
export default new GoogleIntegrationService();