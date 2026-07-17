import io, { Socket } from 'socket.io-client'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000'

class SocketService {
  private socket: Socket | null = null

  connect(token: string) {
    this.socket = io(SOCKET_URL, {
      auth: {
        token,
      },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    })

    this.socket.on('connect', () => {
      console.log('[v0] Socket connected')
    })

    this.socket.on('disconnect', () => {
      console.log('[v0] Socket disconnected')
    })

    this.socket.on('error', (error) => {
      console.error('[v0] Socket error:', error)
    })

    return this.socket
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
  }

  emit(event: string, data: any) {
    if (this.socket) {
      this.socket.emit(event, data)
    }
  }

  on(event: string, callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on(event, callback)
    }
  }

  off(event: string, callback?: (data: any) => void) {
    if (this.socket) {
      this.socket.off(event, callback)
    }
  }

  // Chat events
  joinChat(chatId: string) {
    this.emit('join-chat', { chatId })
  }

  leaveChat(chatId: string) {
    this.emit('leave-chat', { chatId })
  }

  sendMessage(chatId: string, message: string, senderId: string, senderName: string) {
    this.emit('send-message', { chatId, message, senderId, senderName })
  }

  onMessageReceived(callback: (data: any) => void) {
    this.on('message-received', callback)
  }

  onTyping(callback: (data: any) => void) {
    this.on('user-typing', callback)
  }

  // Notification events
  onNotification(callback: (data: any) => void) {
    this.on('notification', callback)
  }

  // Online status
  onUserOnline(callback: (data: any) => void) {
    this.on('user-online', callback)
  }

  onUserOffline(callback: (data: any) => void) {
    this.on('user-offline', callback)
  }

  // Project updates
  onProjectUpdate(callback: (data: any) => void) {
    this.on('project-updated', callback)
  }

  onTaskUpdate(callback: (data: any) => void) {
    this.on('task-updated', callback)
  }
}

export default new SocketService()
