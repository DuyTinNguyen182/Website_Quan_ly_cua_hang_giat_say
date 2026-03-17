const axios = require('axios');
require('dotenv').config();

const BASE_URL = process.env.BASE_URL;
const API_KEY = process.env.API_KEY;
const DEVICE_ID = process.env.DEVICE_ID;

const sendSMS = async (recipients, message) => {
  if (!API_KEY || !DEVICE_ID || !BASE_URL) {
    console.error('Thiếu cấu hình SMS Gateway (TextBee)');
    return;
  }

  try {
    const response = await axios.post(
      `${BASE_URL}/gateway/devices/${DEVICE_ID}/send-sms`,
      {
        recipients,
        message,
      },
      {
        headers: {
          'x-api-key': API_KEY,
        },
      }
    );

    console.log('✅ Gửi SMS thành công!');
    return response.data;
  } catch (error) {
    console.error('❌ Gửi SMS thất bại!');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Error:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
};

module.exports = {
  sendSMS,
};