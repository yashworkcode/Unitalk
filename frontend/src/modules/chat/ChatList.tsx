import { useMemo, useState } from 'react'
import type { Chat } from '../data/mockData'
import { Avatar } from '../shared/Avatar'
import { Icon } from '../shared/Icon'
import type { ChatListStrings } from '../i18n/translations'

type ChatListProps = { chats: Chat[]; selectedId: string | null; onSelect: (chat: Chat) => void; onNewChat: () => void; strings: ChatListStrings }

// A local-first inbox: entries are created by the user and persisted by the parent chat store.
export function ChatList({ chats, selectedId, onSelect, onNewChat, strings }: ChatListProps) {
  const [filter, setFilter] = useState('')
  const [tab, setTab] = useState<'all' | 'unread'>('all')
  const visibleChats = useMemo(() => chats.filter(chat =>
    (tab === 'all' || chat.unread) && `${chat.name} ${chat.handle}`.toLowerCase().includes(filter.toLowerCase())
  ), [chats, filter, tab])
  const unread = chats.reduce((total, chat) => total + (chat.unread ?? 0), 0)
  return (
    <section className="chat-list-panel">
      <div className="chat-list-head">
        <div><p className="eyebrow">{strings.inboxLabel}</p><h1>{strings.messagesHeading}</h1></div>
        <button className="round-button primary" onClick={onNewChat} aria-label={strings.startChatPrompt}><Icon name="plus" size={20}/></button>
      </div>
      <label className="search-field"><Icon name="search" size={18}/><input value={filter} onChange={e => setFilter(e.target.value)} placeholder={strings.searchPlaceholder} /></label>
      <div className="filter-tabs">
        <button className={tab === 'all' ? 'active' : ''} onClick={() => setTab('all')}>{strings.all} <span>{chats.length}</span></button>
        <button className={tab === 'unread' ? 'active' : ''} onClick={() => setTab('unread')}>{strings.unread} <span>{unread}</span></button>
      </div>
      <div className="conversation-scroll">
        {visibleChats.length ? <><p className="section-label">{strings.recent}</p>{visibleChats.map(chat => (
          <button key={chat.id} className={`conversation ${selectedId === chat.id ? 'selected' : ''}`} onClick={() => onSelect(chat)}>
            <Avatar name={chat.name} src={chat.avatar} size="lg" online={chat.online}/>
            <span className="conversation-content"><span className="conversation-title"><strong>{chat.name}</strong><time>{chat.time}</time></span><span className="conversation-preview">{chat.preview || strings.startChatPrompt}</span></span>
            {!!chat.unread && <b className="unread-pill">{chat.unread}</b>}
          </button>
        ))}</> : <div className="inbox-empty"><span className="empty-inbox-icon"><Icon name="message" size={23}/></span><h2>{filter ? strings.noConversationsFound : strings.noConversationsYet}</h2><p>{filter ? strings.tryDifferentName : strings.startChatPrompt}</p>{!filter && <button onClick={onNewChat}><Icon name="plus" size={15}/> {strings.newConversation}</button>}</div>}
      </div>
    </section>
  )
}
