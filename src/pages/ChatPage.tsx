import { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../redux/hooks'
import { fetchChats, fetchMessages, addMessage, setActiveChat } from '../redux/slices/chatsSlice'
import DashboardLayout from '../layouts/DashboardLayout'
import { Send, Plus, Search } from 'lucide-react'

export default function ChatPage() {
  const dispatch = useAppDispatch()
  const { user } = useAppSelector((state) => state.auth)
  const { chats, messages, activeChat } = useAppSelector((state) => state.chats)
  const [messageText, setMessageText] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (user?.company && user._id) {
      dispatch(fetchChats({ company: user.company, userId: user._id }))
    }
  }, [user, dispatch])

  useEffect(() => {
    if (activeChat) {
      dispatch(fetchMessages(activeChat))
    }
  }, [activeChat, dispatch])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!messageText.trim() || !activeChat) return

    dispatch(
      addMessage({
        chatId: activeChat,
        message: {
          _id: Date.now().toString(),
          senderId: user?._id || '',
          senderName: user?.name || '',
          senderProfileImage: user?.profileImage,
          content: messageText,
          chatId: activeChat,
          isRead: false,
          createdAt: new Date(),
        },
      })
    )
    setMessageText('')
  }

  const filteredChats = chats.filter((chat) =>
    chat.groupName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.participantNames?.some((name) => name.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const selectedChat = chats.find((c) => c._id === activeChat)
  const chatMessages = activeChat ? messages[activeChat] || [] : []

  return (
    <DashboardLayout>
      <div className="flex gap-6 h-[calc(100vh-120px)]">
        {/* Chat List */}
        <div className="w-80 flex flex-col bg-background border border-border rounded-xl overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-border">
            <h2 className="text-lg font-bold text-text mb-4">Messages</h2>
            <div className="relative">
              <Search className="absolute left-3 top-3 text-text-light" size={18} />
              <input
                type="text"
                placeholder="Search chats..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              />
            </div>
          </div>

          {/* New Chat Button */}
          <div className="p-4 border-b border-border">
            <button className="w-full flex items-center justify-center gap-2 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition text-sm">
              <Plus size={18} />
              New Chat
            </button>
          </div>

          {/* Chat List */}
          <div className="flex-1 overflow-y-auto">
            {filteredChats.map((chat) => (
              <button
                key={chat._id}
                onClick={() => dispatch(setActiveChat(chat._id))}
                className={`w-full text-left px-4 py-3 border-b border-border hover:bg-surface transition ${
                  activeChat === chat._id ? 'bg-surface' : ''
                }`}
              >
                <p className="font-medium text-text truncate">{chat.groupName || chat.participantNames?.[0]}</p>
                <p className="text-sm text-text-light truncate">{chat.lastMessage}</p>
                <p className="text-xs text-text-light mt-1">
                  {chat.lastMessageTime ? new Date(chat.lastMessageTime).toLocaleTimeString() : ''}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-background border border-border rounded-xl overflow-hidden">
          {activeChat && selectedChat ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-border bg-surface">
                <h3 className="text-lg font-bold text-text">{selectedChat.groupName || selectedChat.participantNames?.[0]}</h3>
                <p className="text-sm text-text-light">{selectedChat.participants.length} members</p>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {chatMessages.map((msg) => (
                  <div
                    key={msg._id}
                    className={`flex gap-3 ${msg.senderId === user?._id ? 'justify-end' : ''}`}
                  >
                    {msg.senderId !== user?._id && (
                      <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                        {msg.senderName?.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div
                      className={`max-w-xs p-3 rounded-lg ${
                        msg.senderId === user?._id
                          ? 'bg-primary text-white'
                          : 'bg-surface text-text'
                      }`}
                    >
                      {msg.senderId !== user?._id && (
                        <p className="text-xs font-medium mb-1 opacity-75">{msg.senderName}</p>
                      )}
                      <p className="text-sm break-words">{msg.content}</p>
                      <p className="text-xs opacity-60 mt-1">
                        {new Date(msg.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Input */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-border bg-surface flex gap-2">
                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button
                  type="submit"
                  className="p-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition"
                >
                  <Send size={20} />
                </button>
              </form>
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-text-light text-lg">Select a chat to start messaging</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
