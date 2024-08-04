

import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody, ConnectedSocket } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';


// Interface for stream information
interface Stream {
  id: string;
  name: string;
}



// Interface for chat messages
interface ChatMessage {
  sender: string;
  message: string;
  timestamp: number;
}


/**
 * WebSocket gateway for handling streaming and chat functionality
 */
@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class StreamingGateway {
  @WebSocketServer()
  server: Server;


  // Store active streams and chat messages
  private activeStreams: Map<string, Stream> = new Map();
  private chatMessages: Map<string, ChatMessage[]> = new Map();

/**
   * Handles the start of a new stream
   * @param data - Contains the name of the stream
   * @param client - The Socket instance of the client
   */
  @SubscribeMessage('startStream')
  handleStartStream(@MessageBody() data: { name: string }, @ConnectedSocket() client: Socket): void {
    console.log(`Stream started: ${client.id}, Name: ${data.name}`);
    const newStream: Stream = { id: client.id, name: data.name };
    this.activeStreams.set(client.id, newStream);
    this.server.emit('streamStarted', newStream);
    this.server.emit('activeStreams', Array.from(this.activeStreams.values()));
  }



  /**
   * Handles a client joining an existing stream
   * @param data - Contains the ID of the stream to join
   * @param client - The Socket instance of the client
   */
  @SubscribeMessage('joinStream')
  handleJoinStream(@MessageBody() data: { streamId: string }, @ConnectedSocket() client: Socket): void {
    console.log(`Client ${client.id} is joining stream ${data.streamId}`);
    client.join(data.streamId);
    this.server.to(data.streamId).emit('userJoined', { userId: client.id });
  }



  /**
   * Handles WebRTC offer messages
   * @param data - Contains the offer and target information
   * @param client - The Socket instance of the client
   */
  @SubscribeMessage('offer')
  handleOffer(@MessageBody() data: any, @ConnectedSocket() client: Socket): void {
    console.log(`Received offer from ${client.id} to ${data.target}`);
    this.server.to(data.target).emit('offer', { sender: client.id, offer: data.offer });
  }


   /**
   * Handles WebRTC answer messages
   * @param data - Contains the answer and target information
   * @param client - The Socket instance of the client
   */
  @SubscribeMessage('answer')
  handleAnswer(@MessageBody() data: any, @ConnectedSocket() client: Socket): void {
    console.log(`Received answer from ${client.id} to ${data.target}`);
    this.server.to(data.target).emit('answer', { sender: client.id, answer: data.answer });
  }



  /**
   * Handles ICE candidate messages
   * @param data - Contains the ICE candidate and target information
   * @param client - The Socket instance of the client
   */
  @SubscribeMessage('iceCandidate')
  handleIceCandidate(@MessageBody() data: any, @ConnectedSocket() client: Socket): void {
    console.log(`Received ICE candidate from ${client.id} to ${data.target}`);
    this.server.to(data.target).emit('iceCandidate', { sender: client.id, candidate: data.candidate });
  }




  
  /**
   * Sends the list of active streams to the requesting client
   * @param client - The Socket instance of the client
   */
  @SubscribeMessage('getActiveStreams')
  handleGetActiveStreams(@ConnectedSocket() client: Socket): void {
    console.log(`Client ${client.id} requested active streams`);
    client.emit('activeStreams', Array.from(this.activeStreams.values()));
  }


  /**
   * Handles incoming chat messages
   * @param data - Contains the stream ID and message content
   * @param client - The Socket instance of the client
   */
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


  /**
   * Sends chat history for a specific stream to the requesting client
   * @param data - Contains the stream ID
   * @param client - The Socket instance of the client
   */
  @SubscribeMessage('getChatHistory')
  handleGetChatHistory(@MessageBody() data: { streamId: string }, @ConnectedSocket() client: Socket): void {
    console.log(`Chat history requested for stream ${data.streamId}`);
    const chatHistory = this.chatMessages.get(data.streamId) || [];
    client.emit('chatHistory', chatHistory);
  }



  
/**
   * Handles the stopping of a stream
   * @param client - The Socket instance of the client
   */
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