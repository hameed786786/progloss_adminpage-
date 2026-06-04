import { Server } from 'http';
import { Server as SocketServer } from 'socket.io';
import { env } from '../config/env';

let io: any = null;

export function initSocket(server: Server) {
  const allowedOrigins = env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim());
  
  io = new SocketServer(server, {
    cors: { 
      origin: allowedOrigins, 
      credentials: true,
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket: any) => {
    socket.on('ping', () => socket.emit('pong', { ok: true }));
  });

  return io;
}

export function emitRoleUpdate(payload: any) {
  io?.emit('roles:update', payload);
}

export function emitPermissionUpdate(payload: any) {
  io?.emit('roles:update', payload);
}

export function emit(channel: string, payload: any) {
  io?.emit(channel, payload);
}
