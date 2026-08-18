import { useState, useEffect, useCallback } from 'react';
import { ticketService } from '@/services/ticketService';
/**
 * useTickets hook
 * Fetches and manages ticket list state for the dashboard.
 * Uses the CQRS query path — no LangGraph involved.
 */
export function useTickets(status) {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const fetchTickets = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await ticketService.getMyTickets(status);
            setTickets(result.tickets);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load tickets');
        }
        finally {
            setLoading(false);
        }
    }, [status]);
    useEffect(() => {
        fetchTickets();
    }, [fetchTickets]);
    return { tickets, loading, error, refetch: fetchTickets };
}
