import { api } from './api';
import { ChatRoom, ChatMessage } from '@/types/chat';
import { PaginatedData } from '@/types/api';

const TAG = '[chat.service]';

// Coalesce concurrent createRoom calls for the same blood request so a
// double-tap can't fire two POSTs in parallel. The server is idempotent
// now, but a double POST would still cost two round-trips.
const inFlightCreate = new Map<string, Promise<ChatRoom>>();

function logErr(method: string, err: any) {
  console.warn(
    `${TAG} ${method} <- ERROR`,
    err?.statusCode ?? '',
    err?.message ?? err
  );
}

export const chatService = {
  async createRoom(bloodRequestId: string): Promise<ChatRoom> {
    const inflight = inFlightCreate.get(bloodRequestId);
    if (inflight) {
      console.log(`${TAG} createRoom <- IN-FLIGHT`, { bloodRequestId });
      return inflight;
    }

    console.log(`${TAG} createRoom -> POST /chat/rooms`, { bloodRequestId });
    const promise = api
      .post<ChatRoom>('/chat/rooms', { bloodRequestId })
      .then((res) => {
        console.log(`${TAG} createRoom <- OK`, {
          id: res?.id,
          bloodRequestId: res?.bloodRequestId,
        });
        return res;
      })
      .catch((err) => {
        logErr('createRoom', err);
        throw err;
      })
      .finally(() => {
        inFlightCreate.delete(bloodRequestId);
      });

    inFlightCreate.set(bloodRequestId, promise);
    return promise;
  },

  async getRooms(): Promise<ChatRoom[]> {
    console.log(`${TAG} getRooms -> GET /chat/rooms`);
    try {
      const res: any = await api.get<any>('/chat/rooms');
      const rooms: ChatRoom[] = Array.isArray(res)
        ? res
        : Array.isArray(res?.data)
        ? res.data
        : [];
      console.log(`${TAG} getRooms <- OK`, {
        count: rooms.length,
        firstKeys: rooms[0] ? Object.keys(rooms[0]) : undefined,
        firstSample: rooms[0],
      });
      return rooms;
    } catch (err) {
      logErr('getRooms', err);
      throw err;
    }
  },

  async getMessages(
    roomId: string,
    page = 1,
    limit = 50
  ): Promise<PaginatedData<ChatMessage>> {
    console.log(`${TAG} getMessages -> GET /chat/rooms/${roomId}/messages`, {
      page,
      limit,
    });
    try {
      const res = await api.get<PaginatedData<ChatMessage>>(
        `/chat/rooms/${roomId}/messages`,
        { page, limit }
      );
      const data: any = Array.isArray(res) ? res : (res as any)?.data;
      console.log(`${TAG} getMessages <- OK`, {
        roomId,
        count: Array.isArray(data) ? data.length : 'non-array',
      });
      return res;
    } catch (err) {
      logErr(`getMessages(${roomId})`, err);
      throw err;
    }
  },
};
