import { apiClient } from './api';
export const ticketService = {
    getMyTickets: async (status) => {
        const params = status ? { status } : {};
        const { data } = await apiClient.get('/queries/tickets', { params });
        return data;
    },
    getTicketDetail: async (ticketId) => {
        const { data } = await apiClient.get(`/queries/tickets/${ticketId}`);
        return data;
    },
    searchTickets: async (query) => {
        const { data } = await apiClient.get('/queries/tickets/search', {
            params: { q: query },
        });
        return data;
    },
};
