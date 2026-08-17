import { Avatar } from '../shared/Avatar'
import { Icon } from '../shared/Icon'
import type { Chat } from '../data/mockData'

type ProfilePanelProps = { chat: Chat; onClose: () => void; onToast: (message: string) => void }

// Contact details follow the selected conversation.
export function ProfilePanel({ chat, onClose, onToast }: ProfilePanelProps) {
  const copyId = async () => { await navigator.clipboard?.writeText(chat.handle); onToast('Contact ID copied to clipboard') }
  return (
    <aside className="profile-panel">
      <header><span>Contact info</span><button onClick={onClose}><Icon name="x" size={20}/></button></header>
      <div className="profile-hero"><div className="cover-art"/><Avatar name={chat.name} src={chat.avatar} size="xl" online={chat.online}/><h2>{chat.name}</h2><p>{chat.handle}</p><span className={`online-status ${chat.online ? '' : 'offline'}`}><i/> {chat.online ? 'Active now' : 'Offline'}</span></div>
      <section className="bio-section"><div className="info-line"><Icon name="globe" size={16}/><span><b>Translation language</b>{chat.language}</span></div></section>
      <section className="profile-section"><button className="section-head" onClick={copyId}><span>User ID <small>{chat.handle}</small></span><Icon name="copy" size={17}/></button></section>
    </aside>
  )
}
