import { useEffect, useRef, useState } from 'react'
import { Send, MessageSquare } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../../redux/hooks'
import { fetchChats, fetchMessages, setActiveChat, addMessage } from '../../redux/slices/chatsSlice'
import apiClient from '../../services/api'
import { PageHeader } from '../../components/common/PageHeader'
import { Card } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import { Button } from '../../components/ui/button'
import { Avatar, AvatarFallback } from '../../components/ui/avatar'
import { EmptyState } from '../../components/common/EmptyState'
import { cn } from '../../lib/utils'
import { getInitials } from '../../utils/helpers'
import { formatDateTime } from '../../lib/utils'
import type { Message } from '../../types'

export default function MessagesPage() {
  const dispatch = useAppDispatch()
  const { chats, messages, activeChat } = useAppSelector((s) => s.chats)
  const { user } = useAppSelector((s) => s.auth)
  const [draft, setDraft] = useState('')
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (user?._id) dispatch(fetchChats({ company: 'digiayudh', userId: user._id }))
  }, [dispatch, user?._id])

  useEffect(() => {
    if (activeChat) dispatch(fetchMessages(activeChat))
  }, [dispatch, activeChat])

  const chatMessages = activeChat ? messages[activeChat] ?? [] : []

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages.length])

  const active = chats.find((c) => c._id === activeChat)

  const send = async () => {
    if (!draft.trim() || !activeChat) return
    const res = await apiClient.sendMessage(activeChat, draft)
    dispatch(addMessage({ chatId: activeChat, message: res.data.data as Message }))
    setDraft('')
  }

  const chatTitle = (c: (typeof chats)[number]) =>
    c.isGroup ? c.groupName || 'Group' : c.participantNames.find((n) => n !== user?.name) || c.participantNames[0]

  return (
    <div className="space-y-6">
      <PageHeader title="Messages" subtitle="Chat with your team and clients." />

      <Card className="grid h-[calc(100vh-14rem)] grid-cols-1 overflow-hidden md:grid-cols-[280px_1fr]">
        {/* Chat list */}
        <div className="border-r border-border">
          <div className="border-b border-border p-3">
            <p className="text-sm font-semibold">Conversations</p>
          </div>
          <div className="overflow-y-auto">
            {chats.map((c) => (
              <button
                key={c._id}
                onClick={() => dispatch(setActiveChat(c._id))}
                className={cn(
                  'flex w-full items-center gap-3 border-b border-border p-3 text-left transition-colors hover:bg-muted/50',
                  activeChat === c._id && 'bg-muted'
                )}
              >
                <Avatar className="h-9 w-9"><AvatarFallback>{getInitials(chatTitle(c))}</AvatarFallback></Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{chatTitle(c)}</p>
                  <p className="truncate text-xs text-text-light">{c.lastMessage || 'No messages yet'}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Thread */}
        <div className="flex min-h-0 flex-col">
          {active ? (
            <>
              <div className="flex items-center gap-3 border-b border-border p-3">
                <Avatar className="h-9 w-9"><AvatarFallback>{getInitials(chatTitle(active))}</AvatarFallback></Avatar>
                <p className="text-sm font-semibold">{chatTitle(active)}</p>
              </div>
              <div className="flex-1 space-y-3 overflow-y-auto p-4">
                {chatMessages.map((m) => {
                  const mine = m.senderId === user?._id
                  return (
                    <div key={m._id} className={cn('flex', mine ? 'justify-end' : 'justify-start')}>
                      <div className={cn('max-w-[75%] rounded-2xl px-4 py-2', mine ? 'bg-primary text-primary-foreground' : 'bg-muted text-text')}>
                        {!mine && <p className="mb-0.5 text-xs font-medium opacity-70">{m.senderName}</p>}
                        <p className="text-sm">{m.content}</p>
                        <p className={cn('mt-1 text-[10px]', mine ? 'text-primary-foreground/70' : 'text-text-light')}>{formatDateTime(m.createdAt)}</p>
                      </div>
                    </div>
                  )
                })}
                <div ref={endRef} />
              </div>
              <div className="flex items-center gap-2 border-t border-border p-3">
                <Input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.nativeEvent.isComposing) send() }}
                  placeholder="Type a message..."
                />
                <Button size="icon" onClick={send} aria-label="Send message"><Send className="h-4 w-4" /></Button>
              </div>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center">
              <EmptyState
                icon={<MessageSquare className="h-6 w-6" />}
                title="Select a conversation"
                description="Choose a chat from the list to start messaging."
              />
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
