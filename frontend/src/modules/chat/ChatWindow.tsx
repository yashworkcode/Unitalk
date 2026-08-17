import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import type { Attachment, Chat, Message } from '../data/mockData'
import { Avatar } from '../shared/Avatar'
import { Icon } from '../shared/Icon'
import type { ChatWindowStrings } from '../i18n/translations'

type ChatWindowProps = {
  chat: Chat | null
  messages: Message[]
  onProfile: () => void
  onSend: (payload: { text: string; attachment?: Attachment }) => void
  onLanguageChange: (language: string) => void
  onNewChat: () => void
  onToggleMobileList: () => void
  autoTranslate: boolean
  showOriginal: boolean
  strings: ChatWindowStrings
}

const languages = ['English', 'Hindi', 'Spanish', 'Portuguese', 'French', 'Japanese', 'Arabic', 'German']
const fileAsDataUrl = (file: Blob) => new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = reject; reader.readAsDataURL(file) })

// Live composer supports text, media and recorded audio in the browser. Upload payloads can be sent to a media API later.
export function ChatWindow({ chat, messages, onProfile, onSend, onLanguageChange, onNewChat, onToggleMobileList, autoTranslate, showOriginal, strings }: ChatWindowProps) {
  const [draft, setDraft] = useState('')
  const [attachOpen, setAttachOpen] = useState(false)
  const [languageOpen, setLanguageOpen] = useState(false)
  const [recording, setRecording] = useState(false)
  const [notice, setNotice] = useState('')
  const imageInput = useRef<HTMLInputElement>(null)
  const videoInput = useRef<HTMLInputElement>(null)
  const recorder = useRef<MediaRecorder | null>(null)
  const stream = useRef<MediaStream | null>(null)
  const scrollRef = useRef<HTMLElement>(null)
  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages, chat?.id])
  if (!chat) return <main className="chat-window no-active-chat"><button className="mobile-menu" onClick={onToggleMobileList} aria-label="Open conversations"><Icon name="menu"/></button><div className="start-chat-state"><span><Icon name="message" size={30}/></span><h1>{strings.startHeading}</h1><p>{strings.startText}</p><button onClick={onNewChat}><Icon name="plus" size={17}/> {strings.startButton}</button></div></main>
  const send = () => {
    const text = draft.trim()
    if (!text) return
    onSend({ text })
    setDraft('')
  }
  const attachFile = async (event: ChangeEvent<HTMLInputElement>, kind: Attachment['kind']) => {
    const file = event.target.files?.[0]
    if (!file) return
    try {
      const url = await fileAsDataUrl(file)
      onSend({ text: kind === 'image' ? 'Sent an image' : 'Sent a video', attachment: { kind, name: file.name, url } })
      setAttachOpen(false)
    } catch { setNotice('This file could not be added. Please try another one.') }
    event.target.value = ''
  }
  const toggleRecording = async () => {
    if (recording && recorder.current) { recorder.current.stop(); return }
    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) { setNotice('Voice recording is not supported in this browser.'); return }
    try {
      const activeStream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(activeStream)
      const chunks: Blob[] = []
      mediaRecorder.ondataavailable = event => { if (event.data.size) chunks.push(event.data) }
      mediaRecorder.onstop = async () => {
        const voice = new Blob(chunks, { type: mediaRecorder.mimeType || 'audio/webm' })
        const url = await fileAsDataUrl(voice)
        onSend({ text: 'Voice message', attachment: { kind: 'audio', name: 'Voice message.webm', url } })
        activeStream.getTracks().forEach(track => track.stop())
        recorder.current = null; stream.current = null; setRecording(false)
      }
      recorder.current = mediaRecorder; stream.current = activeStream; mediaRecorder.start(); setRecording(true)
    } catch { setNotice('Microphone access was not granted.') }
  }
  return (
    <main className="chat-window">
      <header className="chat-header">
        <button className="mobile-menu" onClick={onToggleMobileList} aria-label="Open conversations"><Icon name="menu"/></button>
        <button className="chat-person" onClick={onProfile}><Avatar name={chat.name} src={chat.avatar} size="md" online={chat.online}/><span><strong>{chat.name}</strong><small>{chat.online ? 'Online' : chat.handle}</small></span></button>
        <div className="chat-actions"><button className="language-header-button" onClick={() => setLanguageOpen(!languageOpen)} title={strings.translationLanguageTitle}><Icon name="globe" size={17}/><span>{chat.language}</span><Icon name="chevronDown" size={14}/></button></div>
      </header>
      {languageOpen && <div className="language-drawer"><div><span className="translate-icon"><Icon name="sparkle" size={15}/></span><p><b>{strings.translationLanguageTitle}</b><small>{strings.translationLanguageDescription}</small></p></div><label><span>{strings.translateToLabel}</span><select value={chat.language} onChange={event => onLanguageChange(event.target.value)}>{languages.map(language => <option key={language}>{language}</option>)}</select></label></div>}
      <section className="message-scroll" ref={scrollRef}>
        {messages.length === 0 ? <div className="thread-empty"><span><Icon name="sparkle" size={20}/></span><h2>{strings.beginningHeading}</h2><p>{strings.beginningText}</p></div> : <><div className="date-divider"><span>Today</span></div>{messages.map(message => {
          // The backend already translated `text` into this chat's target
          // language before it ever reached the browser (see
          // backend/socket/chatSocket.js and backend/routes/messages.js) -
          // no client-side re-translation needed.
          const displayText = message.text
          return <div className={`message-row ${message.from}`} key={message.id}>{message.from === 'them' && <Avatar name={chat.name} src={chat.avatar} size="sm" online={chat.online}/>}<div className="message-stack"><div className={`bubble ${message.from} ${message.attachment ? 'attachment-bubble' : ''}`}>{message.attachment?.kind === 'image' && <img className="chat-image" src={message.attachment.url} alt={message.attachment.name}/>} {message.attachment?.kind === 'video' && <video className="chat-video" controls src={message.attachment.url}/>} {message.attachment?.kind === 'audio' && <div className="voice-note"><Icon name="mic" size={17}/><audio controls src={message.attachment.url}/><span>Voice message</span></div>}<p>{displayText}{autoTranslate && message.translated ? ' (translated)' : ''}</p>{showOriginal && message.original && message.original !== displayText ? <p className="message-original">{message.original}</p> : null}<time>{message.time} {message.from === 'me' && <Icon name="checkDouble" size={14}/>}</time></div></div></div>})}</>}
      </section>
      {notice && <div className="composer-notice"><span>{notice}</span><button onClick={() => setNotice('')}><Icon name="x" size={14}/></button></div>}
      <footer className="composer-wrap"><div className={`composer ${recording ? 'recording' : ''}`}><div className="attach-wrap"><button onClick={() => setAttachOpen(!attachOpen)} title="Attach image or video"><Icon name="paperclip"/></button>{attachOpen && <div className="attach-menu"><button onClick={() => imageInput.current?.click()}><Icon name="image" size={17}/><span><b>Image</b><small>JPG, PNG, WEBP</small></span></button><button onClick={() => videoInput.current?.click()}><Icon name="video" size={17}/><span><b>Video</b><small>MP4, WEBM, MOV</small></span></button></div>}</div><input value={draft} onChange={event => setDraft(event.target.value)} onKeyDown={event => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); send() } }} placeholder={recording ? 'Recording voice message…' : strings.composerPlaceholder.replace('{name}', chat.name.split(' ')[0])} disabled={recording}/>{draft ? <button className="send-button" onClick={send} aria-label="Send message"><Icon name="send" size={19}/></button> : <button className={`voice-button ${recording ? 'active' : ''}`} onClick={toggleRecording} aria-label={recording ? 'Stop recording' : 'Record voice message'}>{recording ? <Icon name="stop" size={16}/> : <Icon name="mic" size={19}/>}</button>}<input ref={imageInput} onChange={event => attachFile(event, 'image')} type="file" accept="image/*" hidden/><input ref={videoInput} onChange={event => attachFile(event, 'video')} type="file" accept="video/*" hidden/></div><p><Icon name="sparkle" size={13}/> {strings.storedNotice} <button onClick={() => setLanguageOpen(true)}>Translation language: {chat.language}</button></p></footer>
    </main>
  )
}
