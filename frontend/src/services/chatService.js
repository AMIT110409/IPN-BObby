import { apiClient } from './api';
export const chatService = {
    sendMessage: async (request) => {
        const { data } = await apiClient.post('/commands/chat', request);
        return data;
    },
    approveAction: async (request) => {
        const { data } = await apiClient.post('/commands/chat/approve', request);
        return data;
    },
};
