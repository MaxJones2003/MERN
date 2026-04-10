import { authFetch } from '../utils/authFetch';

export interface Server {
  _id: string;
  serverName: string;
  description?: string;
  serverIcon?: string;
  ownerId: string;
  members: string[];
  textChannels: any[];
  voiceChannels: any[];
  createdAt: string;
}

export interface CreateServerRequest {
  serverName: string;
  description?: string;
}

export interface CreateChannelRequest {
  channelName: string;
  topic?: string;
  userId: string;
}

// Matches the shape returned by textChannelsController
export interface Channel {
  _id: string;
  serverId: string;
  channelName: string;
  topic?: string;
  createdAt: string;
}

export const getUserServers = async (): Promise<Server[]> => {
  try {
    const response = await authFetch('api/users/servers');
    if (!response.ok) throw new Error('Failed to fetch servers');
    const data = await response.json();
    return data.servers || [];
  } catch (error) {
    console.error('Error fetching servers:', error);
    throw error;
  }
};

export const createServer = async (serverData: CreateServerRequest): Promise<Server> => {
  try {
    const response = await authFetch('api/servers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(serverData),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create server');
    }
    const data = await response.json();
    return data.server;
  } catch (error) {
    console.error('Error creating server:', error);
    throw error;
  }
};

export const getServer = async (serverId: string): Promise<Server> => {
  try {
    const response = await authFetch(`api/servers/${serverId}`);
    if (!response.ok) throw new Error('Failed to fetch server');
    const data = await response.json();
    return data.server;
  } catch (error) {
    console.error('Error fetching server:', error);
    throw error;
  }
};

export const deleteServer = async (serverId: string): Promise<void> => {
  try {
    const response = await authFetch(`api/servers/${serverId}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Failed to delete server');
  } catch (error) {
    console.error('Error deleting server:', error);
    throw error;
  }
};

// Creates a text channel via textChannelsController
// POST /api/servers/:serverId/textChannels → returns { textChannel, error }
export const createTextChannel = async (serverId: string, channelData: CreateChannelRequest): Promise<Channel> => {
  try {
    const response = await authFetch(`api/servers/${serverId}/textChannels`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(channelData),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create channel');
    }
    const data = await response.json();
    // textChannelsController returns { textChannel }, not { channel }
    return data.textChannel;
  } catch (error) {
    console.error('Error creating channel:', error);
    throw error;
  }
};

// Kept for backwards-compatibility — no longer called from ServerPage
// (ServerPage now uses authFetch directly for deletion)
export const deleteTextChannel = async (serverId: string, channelId: string, _userId: string): Promise<void> => {
  try {
    const response = await authFetch(`api/servers/${serverId}/textChannels/${channelId}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to delete channel');
    }
  } catch (error) {
    console.error('Error deleting channel:', error);
    throw error;
  }
};
