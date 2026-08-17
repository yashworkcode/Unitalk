import { useEffect, useRef, useState } from 'react'
import { Sidebar } from './modules/navigation/Sidebar'
import { ChatList } from './modules/chat/ChatList'
import { ChatWindow } from './modules/chat/ChatWindow'
import { NewChatModal } from './modules/chat/NewChatModal'
import { ProfilePanel } from './modules/profile/ProfilePanel'
import { SettingsModal } from './modules/settings/SettingsModal'
import { translations, type Locale } from './modules/i18n/translations'
import type { Chat, Message } from './modules/data/mockData'
import { Icon } from './modules/shared/Icon'
import { AuthPage } from './modules/auth/AuthPage'
import { MyProfilePage } from './modules/profile/MyProfilePage'
import {
  authApi, chatsApi, messagesApi, usersApi,
  getToken, setToken,
  type ApiChat, type ApiMessage, type ApiUser,
} from './modules/api/client'
import {
  connectSocket, disconnectSocket, getSocket,
  type ReceivePayload, type ChatPreviewPayload, type PresencePayload,
} from './modules/api/socket'

type Modal = 'new-chat' | 'settings' | null
const SETTINGS_STORE = 'unitalk.uiSettings' // UI-only preferences (not tied to the backend)

type SettingsState = {
  autoTranslate: boolean
  showOriginal: boolean
  defaultLanguage: string
  appLanguage: Locale
}

function formatTime(iso?: string) {
  if (!iso) return 'Now'
  try { return new Intl.DateTimeFormat([], { hour: 'numeric', minute: '2-digit' }).format(new Date(iso)) }
  catch { return 'Now' }
}

function toUiChat(chat: ApiChat): Chat {
  return {
    id: chat.id, name: chat.name, handle: chat.handle, avatar: chat.avatar,
    online: chat.online, language: chat.language, native: chat.native,
    preview: chat.preview, time: formatTime(chat.time), unread: chat.unread,
    otherUserId: chat.otherUserId,
  }
}

function toUiMessage(message: ApiMessage): Message {
  return {
    id: message.id, from: message.from, text: message.text, time: formatTime(message.time),
    original: message.original, translated: message.translated, attachment: message.attachment,
  }
}

function savedUiSettings(): SettingsState {
  try {
    const data = JSON.parse(localStorage.getItem(SETTINGS_STORE) ?? '{}')
    const appLanguage = typeof data.appLanguage === 'string' && ['English', 'Spanish', 'French'].includes(data.appLanguage) ? data.appLanguage as Locale : 'English'
    return {
      autoTranslate: typeof data.autoTranslate === 'boolean' ? data.autoTranslate : true,
      showOriginal: typeof data.showOriginal === 'boolean' ? data.showOriginal : false,
      defaultLanguage: typeof data.defaultLanguage === 'string' ? data.defaultLanguage : 'English',
      appLanguage,
    }
  } catch {
    return { autoTranslate: true, showOriginal: false, defaultLanguage: 'English', appLanguage: 'English' }
  }
}

function App() {
  const [booting, setBooting] = useState(true)
  const [authenticated, setAuthenticated] = useState(false)
  const [apiUser, setApiUser] = useState<ApiUser | null>(null)
  const [chatItems, setChatItems] = useState<Chat[]>([])
  const [messagesByChat, setMessagesByChat] = useState<Record<string, Message[]>>({})
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null)
  const [panelOpen, setPanelOpen] = useState(false)
  const [modal, setModal] = useState<Modal>(null)
  const [dark, setDark] = useState(false)
  const [toast, setToast] = useState('')
  const [mobileChats, setMobileChats] = useState(false)
  const [page, setPage] = useState<'messages' | 'profile'>('messages')
  const [{ autoTranslate, showOriginal, defaultLanguage, appLanguage }, setSettings] = useState<SettingsState>(savedUiSettings)
  const joinedChatRef = useRef<string | null>(null)

  const selectedChat = chatItems.find(chat => chat.id === selectedChatId) ?? null
  const profile = apiUser
    ? { name: apiUser.name, handle: apiUser.handle, userId: apiUser.userId, avatar: apiUser.avatar }
    : { name: '', handle: '', userId: '', avatar: '' }
  const strings = translations[appLanguage]
  const showToast = (message: string) => setToast(message)
  const toggleTheme = () => setDark(value => !value)

  // ---- Boot: try to resume a session from a saved JWT ----
  useEffect(() => {
    const token = getToken()
    if (!token) { setBooting(false); return }
    authApi.me()
      .then(({ user }) => { setApiUser(user); setAuthenticated(true) })
      .catch(() => setToken(null))
      .finally(() => setBooting(false))
  }, [])

  // ---- Persist UI-only preferences ----
  useEffect(() => { if (toast) { const timer = window.setTimeout(() => setToast(''), 2800); return () => window.clearTimeout(timer) } }, [toast])
  useEffect(() => { document.documentElement.dataset.theme = dark ? 'dark' : 'light' }, [dark])
  useEffect(() => { try { localStorage.setItem(SETTINGS_STORE, JSON.stringify({ autoTranslate, showOriginal, defaultLanguage, appLanguage })) } catch { /* not critical */ } }, [autoTranslate, showOriginal, defaultLanguage, appLanguage])

  // ---- Load conversations once authenticated ----
  useEffect(() => {
    if (!authenticated) return
    chatsApi.list().then(({ chats }) => setChatItems(chats.map(toUiChat))).catch(() => showToast('Could not load your conversations'))
  }, [authenticated])

  // ---- Connect the real-time socket once authenticated ----
  useEffect(() => {
    if (!authenticated) return
    const token = getToken()
    if (!token) return
    const socket = connectSocket(token)

    const onReceive = (payload: ReceivePayload) => {
      const mine = payload.senderId === apiUser?.id
      const side = mine ? payload.me : payload.them
      const message: Message = {
        id: payload.id, from: mine ? 'me' : 'them', text: side.text, original: side.original,
        translated: side.translated, time: formatTime(payload.createdAt),
        attachment: payload.attachment?.url ? payload.attachment : undefined,
      }
      setMessagesByChat(threads => ({ ...threads, [payload.chatId]: [...(threads[payload.chatId] ?? []), message] }))
      setChatItems(items => items.map(item => item.id === payload.chatId
        ? { ...item, preview: side.text, time: formatTime(payload.createdAt) }
        : item))
    }
    const onPreview = (payload: ChatPreviewPayload) => {
      setChatItems(items => items.map(item => item.id === payload.chatId
        ? { ...item, preview: payload.preview, time: formatTime(payload.time), unread: item.id === selectedChatId ? item.unread : (item.unread ?? 0) + 1 }
        : item))
    }
    const onOnline = ({ userId }: PresencePayload) => setChatItems(items => items.map(item => item.otherUserId === userId ? { ...item, online: true } : item))
    const onOffline = ({ userId }: PresencePayload) => setChatItems(items => items.map(item => item.otherUserId === userId ? { ...item, online: false } : item))

    socket.on('message:receive', onReceive)
    socket.on('chat:preview', onPreview)
    socket.on('user:online', onOnline)
    socket.on('user:offline', onOffline)

    return () => {
      socket.off('message:receive', onReceive)
      socket.off('chat:preview', onPreview)
      socket.off('user:online', onOnline)
      socket.off('user:offline', onOffline)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authenticated, apiUser?.id, selectedChatId])

  // ---- Join/leave the Socket.IO room for whichever chat is open, and load its history ----
  useEffect(() => {
    const socket = getSocket()
    if (joinedChatRef.current && joinedChatRef.current !== selectedChatId) {
      socket?.emit('chat:leave', { chatId: joinedChatRef.current })
    }
    if (!selectedChatId) { joinedChatRef.current = null; return }
    socket?.emit('chat:join', { chatId: selectedChatId })
    joinedChatRef.current = selectedChatId

    messagesApi.history(selectedChatId)
      .then(({ messages }) => setMessagesByChat(threads => ({ ...threads, [selectedChatId]: messages.map(toUiMessage) })))
      .catch(() => showToast('Could not load this conversation'))
    setChatItems(items => items.map(item => item.id === selectedChatId ? { ...item, unread: 0 } : item))
  }, [selectedChatId])

  const handleAuthenticated = (user: ApiUser) => {
    setApiUser(user)
    setAuthenticated(true)
  }

  const handleChat = (chat: Chat) => { setSelectedChatId(chat.id); setPanelOpen(false); setMobileChats(false) }

  const createChat = async ({ username, language }: { username: string; language: string }) => {
    try {
      const { chat } = await chatsApi.create({ username, language })
      const uiChat = toUiChat(chat)
      setChatItems(items => [uiChat, ...items.filter(item => item.id !== uiChat.id)])
      setSelectedChatId(uiChat.id); setPanelOpen(false); setModal(null); setMobileChats(false)
      showToast(`Conversation with ${uiChat.name} created`)
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Could not start that conversation')
    }
  }

  const sendMessage = ({ text, attachment }: { text: string; attachment?: Message['attachment'] }) => {
    if (!selectedChat) return
    const socket = getSocket()
    if (!socket) { showToast('Reconnecting… please try again in a moment'); return }
    const messageType = attachment?.kind ?? 'text'
    socket.emit('message:send', { chatId: selectedChat.id, text, messageType, attachment })
  }

  const changeLanguage = async (language: string) => {
    if (!selectedChat) return
    try {
      const { chat } = await chatsApi.changeLanguage(selectedChat.id, language)
      const uiChat = toUiChat(chat)
      setChatItems(items => items.map(item => item.id === uiChat.id ? uiChat : item))
      getSocket()?.emit('chat:language-changed', { chatId: selectedChat.id, language })
      // Re-fetch history so every past message is translated into the new language
      const { messages } = await messagesApi.history(selectedChat.id)
      setMessagesByChat(threads => ({ ...threads, [selectedChat.id]: messages.map(toUiMessage) }))
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Could not change the translation language')
    }
  }

  const toggleAutoTranslate = () => setSettings(settings => ({ ...settings, autoTranslate: !settings.autoTranslate }))
  const toggleShowOriginal = () => {
    setSettings(settings => ({ ...settings, showOriginal: !settings.showOriginal }))
    usersApi.updateSettings({ showOriginalMessage: !showOriginal }).catch(() => {})
  }
  const setDefaultLanguage = (language: string) => setSettings(settings => ({ ...settings, defaultLanguage: language }))
  const setAppLanguage = (language: Locale) => setSettings(settings => ({ ...settings, appLanguage: language }))

  const handleLogout = () => {
    authApi.logout().catch(() => {})
    disconnectSocket()
    setToken(null)
    setAuthenticated(false)
    setApiUser(null)
    setChatItems([])
    setMessagesByChat({})
    setSelectedChatId(null)
    setPage('messages')
    setModal(null)
  }

  const handleProfileSave = async (nextProfile: { name: string; handle: string; userId: string; avatar: string }) => {
    try {
      const { user } = await usersApi.updateProfile({ name: nextProfile.name, avatar: nextProfile.avatar })
      setApiUser(user)
      showToast('Your profile has been updated')
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Could not update your profile')
    }
  }

  const navigate = (destination: string) => {
    if (destination === 'profile') setPage('profile')
    else if (destination === 'settings') { setPage('messages'); setModal('settings') }
    else { setPage('messages'); setMobileChats(true) }
  }

  if (booting) return <div className="app-shell" />
  if (!authenticated) return <AuthPage onAuthenticated={handleAuthenticated} />

  return (
    <div className={`app-shell ${dark ? 'dark' : ''}`}>
      <div className="ambient ambient-one"/><div className="ambient ambient-two"/>
      <div className="app-frame">
        <div className="workspace">
          {page === 'profile' ? <MyProfilePage profile={profile} onSave={handleProfileSave} onLogout={handleLogout} onBack={() => setPage('messages')}/> : <div className="content-grid">
            <div className={`chat-list-wrap ${mobileChats ? 'show-mobile' : ''}`}><ChatList chats={chatItems} selectedId={selectedChatId} onSelect={handleChat} onNewChat={() => setModal('new-chat')} strings={strings.chatList}/></div>
            <ChatWindow chat={selectedChat} messages={selectedChat ? messagesByChat[selectedChat.id] ?? [] : []} onProfile={() => setPanelOpen(!panelOpen)} onSend={sendMessage} onLanguageChange={changeLanguage} onNewChat={() => setModal('new-chat')} onToggleMobileList={() => setMobileChats(!mobileChats)} autoTranslate={autoTranslate} showOriginal={showOriginal} strings={strings.chatWindow}/>
            {panelOpen && selectedChat && <ProfilePanel chat={selectedChat} onClose={() => setPanelOpen(false)} onToast={showToast}/>}
          </div>}
        </div>
        <Sidebar active={page} onNavigate={navigate} onThemeToggle={toggleTheme} dark={dark} user={profile} strings={strings.sidebar}/>
      </div>
      {modal === 'new-chat' && <NewChatModal onClose={() => setModal(null)} onCreate={createChat} defaultLanguage={defaultLanguage} strings={strings.newChatModal}/>}
      {modal === 'settings' && <SettingsModal onClose={() => setModal(null)} dark={dark} onThemeToggle={toggleTheme} autoTranslate={autoTranslate} showOriginal={showOriginal} onAutoTranslateToggle={toggleAutoTranslate} onShowOriginalToggle={toggleShowOriginal} defaultLanguage={defaultLanguage} appLanguage={appLanguage} onDefaultLanguageChange={setDefaultLanguage} onAppLanguageChange={setAppLanguage} strings={strings.settingsModal}/>}
      {toast && <div className="toast"><Icon name="check" size={18}/>{toast}</div>}
    </div>
  )
}

export default App
