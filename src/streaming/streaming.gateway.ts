

/*

import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody, ConnectedSocket } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

interface Stream {
  id: string;
  name: string;
}

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class StreamingGateway {
  @WebSocketServer()
  server: Server;

  private activeStreams: Map<string, Stream> = new Map();

  @SubscribeMessage('startStream')
  handleStartStream(@MessageBody() data: { name: string }, @ConnectedSocket() client: Socket): void {
    console.log(`Stream started: ${client.id}, Name: ${data.name}`);
    const newStream: Stream = { id: client.id, name: data.name };
    this.activeStreams.set(client.id, newStream);
    this.server.emit('streamStarted', newStream);
    this.server.emit('activeStreams', Array.from(this.activeStreams.values()));
    console.log(`Active streams: ${JSON.stringify(Array.from(this.activeStreams.values()))}`);
  }

  @SubscribeMessage('joinStream')
  handleJoinStream(@MessageBody() data: { streamId: string }, @ConnectedSocket() client: Socket): void {
    console.log(`Client ${client.id} is joining stream ${data.streamId}`);
    client.to(data.streamId).emit('userJoined', { userId: client.id });
  }

  @SubscribeMessage('offer')
  handleOffer(@MessageBody() data: any, @ConnectedSocket() client: Socket): void {
    console.log(`Received offer from ${client.id} to ${data.target}`);
    client.to(data.target).emit('offer', { ...data, sender: client.id });
  }

  @SubscribeMessage('answer')
  handleAnswer(@MessageBody() data: any, @ConnectedSocket() client: Socket): void {
    console.log(`Received answer from ${client.id} to ${data.target}`);
    client.to(data.target).emit('answer', { ...data, sender: client.id });
  }

  @SubscribeMessage('iceCandidate')
  handleIceCandidate(@MessageBody() data: any, @ConnectedSocket() client: Socket): void {
    console.log(`Received ICE candidate from ${client.id} to ${data.target}`);
    client.to(data.target).emit('iceCandidate', { ...data, sender: client.id });
  }

  @SubscribeMessage('stopStream')
  handleStopStream(@ConnectedSocket() client: Socket): void {
    console.log(`Stream stopped: ${client.id}`);
    this.activeStreams.delete(client.id);
    this.server.emit('streamStopped', client.id);
    this.server.emit('activeStreams', Array.from(this.activeStreams.values()));
    console.log(`Active streams after stop: ${JSON.stringify(Array.from(this.activeStreams.values()))}`);
  }

  @SubscribeMessage('getActiveStreams')
  handleGetActiveStreams(@ConnectedSocket() client: Socket): void {
    console.log(`Client ${client.id} requested active streams`);
    client.emit('activeStreams', Array.from(this.activeStreams.values()));
  }
}

*/

import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody, ConnectedSocket } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

interface Stream {
  id: string;
  name: string;
}

interface ChatMessage {
  sender: string;
  message: string;
  timestamp: number;
}


/*
@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class StreamingGateway {
  @WebSocketServer()
  server: Server;

  private activeStreams: Map<string, Stream> = new Map();
  private chatMessages: Map<string, ChatMessage[]> = new Map();
*/


@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class StreamingGateway {
  @WebSocketServer()
  server: Server;

  private activeStreams: Map<string, Stream> = new Map();
  private chatMessages: Map<string, ChatMessage[]> = new Map();


  @SubscribeMessage('startStream')
  handleStartStream(@MessageBody() data: { name: string }, @ConnectedSocket() client: Socket): void {
    console.log(`Stream started: ${client.id}, Name: ${data.name}`);
    const newStream: Stream = { id: client.id, name: data.name };
    this.activeStreams.set(client.id, newStream);
    this.server.emit('streamStarted', newStream);
    this.server.emit('activeStreams', Array.from(this.activeStreams.values()));
  }

  @SubscribeMessage('joinStream')
  handleJoinStream(@MessageBody() data: { streamId: string }, @ConnectedSocket() client: Socket): void {
    console.log(`Client ${client.id} is joining stream ${data.streamId}`);
    client.join(data.streamId);
    this.server.to(data.streamId).emit('userJoined', { userId: client.id });
  }

  @SubscribeMessage('offer')
  handleOffer(@MessageBody() data: any, @ConnectedSocket() client: Socket): void {
    console.log(`Received offer from ${client.id} to ${data.target}`);
    this.server.to(data.target).emit('offer', { sender: client.id, offer: data.offer });
  }

  @SubscribeMessage('answer')
  handleAnswer(@MessageBody() data: any, @ConnectedSocket() client: Socket): void {
    console.log(`Received answer from ${client.id} to ${data.target}`);
    this.server.to(data.target).emit('answer', { sender: client.id, answer: data.answer });
  }

  @SubscribeMessage('iceCandidate')
  handleIceCandidate(@MessageBody() data: any, @ConnectedSocket() client: Socket): void {
    console.log(`Received ICE candidate from ${client.id} to ${data.target}`);
    this.server.to(data.target).emit('iceCandidate', { sender: client.id, candidate: data.candidate });
  }

/*
  @SubscribeMessage('stopStream')
  handleStopStream(@ConnectedSocket() client: Socket): void {
    console.log(`Stream stopped: ${client.id}`);
    this.activeStreams.delete(client.id);
    this.server.emit('streamStopped', client.id);
    this.server.emit('activeStreams', Array.from(this.activeStreams.values()));
    console.log(`Active streams after stop: ${JSON.stringify(Array.from(this.activeStreams.values()))}`);
  }
*/
  @SubscribeMessage('getActiveStreams')
  handleGetActiveStreams(@ConnectedSocket() client: Socket): void {
    console.log(`Client ${client.id} requested active streams`);
    client.emit('activeStreams', Array.from(this.activeStreams.values()));
  }

  @SubscribeMessage('chatMessage')
  handleChatMessage(@MessageBody() data: { streamId: string, message: string }, @ConnectedSocket() client: Socket): void {
    console.log(`Chat message received for stream ${data.streamId}: ${data.message}`);
    const chatMessage: ChatMessage = {
      sender: client.id,
      message: data.message,
      timestamp: Date.now(),
    };
    
    if (!this.chatMessages.has(data.streamId)) {
      this.chatMessages.set(data.streamId, []);
    }
    this.chatMessages.get(data.streamId).push(chatMessage);
    
    this.server.to(data.streamId).emit('chatMessage', chatMessage);
  }

  @SubscribeMessage('getChatHistory')
  handleGetChatHistory(@MessageBody() data: { streamId: string }, @ConnectedSocket() client: Socket): void {
    console.log(`Chat history requested for stream ${data.streamId}`);
    const chatHistory = this.chatMessages.get(data.streamId) || [];
    client.emit('chatHistory', chatHistory);
  }


  @SubscribeMessage('stopStream')
  handleStopStream(@ConnectedSocket() client: Socket): void {
    console.log(`Stream stopped: ${client.id}`);
    const stoppedStream = this.activeStreams.get(client.id);
    if (stoppedStream) {
      this.activeStreams.delete(client.id);
      this.server.emit('streamStopped', stoppedStream);
      this.server.emit('activeStreams', Array.from(this.activeStreams.values()));
      console.log(`Active streams after stop: ${JSON.stringify(Array.from(this.activeStreams.values()))}`);
    }
  }

}