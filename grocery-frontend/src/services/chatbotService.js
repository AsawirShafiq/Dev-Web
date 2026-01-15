import axios from 'axios';

const CHATBOT_API_URL = 'http://127.0.0.1:8001';

export const chatbotService = {
  sendMessage: async (query, userId, accessToken) => {
    return axios.post(`${CHATBOT_API_URL}/chat`, {
      query,
      user_id: userId,
      access_token: accessToken
    });
  },

  reindexProducts: async () => {
    return axios.post(`${CHATBOT_API_URL}/chat/reindex`);
  },

  healthCheck: async () => {
    return axios.get(`${CHATBOT_API_URL}/health`);
  }
};
