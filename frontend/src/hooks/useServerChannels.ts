import { useEffect, useState, useCallback } from 'react';
import { authFetch } from '../utils/authFetch';

export interface TextChannel {
  _id: string;
  serverId: string;
  channelName: string;
  topic?: string;
  createdAt: string;
}

export interface VoiceChannel {
  _id: string;
  serverId: string;
  channelName: string;
  activeMembers?: string[];
  createdAt: string;
}

interface UseServerChannelsResult {
  textChannels: TextChannel[];
  voiceChannels: VoiceChannel[];
  loading: boolean;
  error: string;
  refresh: () => void;
}

/**
 * Fetches text and voice channels for a server from their dedicated API endpoints.
 *
 * WHY THIS EXISTS:
 * getServer() returns server.textChannels as an array of ObjectIds (not full
 * channel objects), because textChannelsController stores channels in a separate
 * collection and only pushes the inserted _id into the server doc. This hook
 * calls the proper endpoints to get the full channel data.
 */
export const useServerChannels = (serverId?: string): UseServerChannelsResult => {
  const [textChannels, setTextChannels] = useState<TextChannel[]>([]);
  const [voiceChannels, setVoiceChannels] = useState<VoiceChannel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchChannels = useCallback(async () => {
    if (!serverId) {
      setTextChannels([]);
      setVoiceChannels([]);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const [textRes, voiceRes] = await Promise.all([
        authFetch(`api/servers/${serverId}/textChannels`),
        authFetch(`api/servers/${serverId}/voiceChannels`),
      ]);

      if (textRes.ok) {
        const data = await textRes.json();
        setTextChannels(data.textChannels || []);
      } else {
        setError('Failed to load text channels');
      }

      if (voiceRes.ok) {
        const data = await voiceRes.json();
        setVoiceChannels(data.channels || []);
      }
    } catch (e: any) {
      setError(e.message || 'Failed to load channels');
    } finally {
      setLoading(false);
    }
  }, [serverId]);

  useEffect(() => {
    fetchChannels();
  }, [fetchChannels]);

  return {
    textChannels,
    voiceChannels,
    loading,
    error,
    refresh: fetchChannels,
  };
};
