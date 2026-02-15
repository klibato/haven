import { Socket } from "socket.io";

export function registerChannelHandlers(socket: Socket) {
  socket.on("channel:join", (data: { channelId: string }) => {
    socket.join(`channel:${data.channelId}`);
  });

  socket.on("channel:leave", (data: { channelId: string }) => {
    socket.leave(`channel:${data.channelId}`);
  });
}
