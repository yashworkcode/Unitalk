import { Icon } from '../shared/Icon'
import { Avatar } from '../shared/Avatar'
import type { currentUser } from '../data/mockData'

import type { SidebarStrings } from '../i18n/translations'

type SidebarProps = {
  active: string
  onNavigate: (page: string) => void
  onThemeToggle: () => void
  dark: boolean
  user: typeof currentUser
  strings: SidebarStrings
}

// Primary application navigation, presented as a single bottom bar rather
// than a vertical rail — brand + primary nav on the left, settings, theme,
// and the account switcher on the right.
export function Sidebar({ active, onNavigate, onThemeToggle, dark, user, strings }: SidebarProps) {
  const nav = [
    { id: 'messages', label: strings.messages, icon: 'message' as const },
  ]
  return (
    <div className="bottom-bar">
      <button className="brand" onClick={() => onNavigate('messages')} aria-label={strings.homeLabel}>
        <span className="brand-mark"><span /> <span /> <span /></span>
        <span>{strings.brand}</span>
      </button>
      <nav className="bottom-nav" aria-label="Main navigation">
        {nav.map(item => (
          <button key={item.id} className={`nav-item ${active === item.id ? 'active' : ''}`} onClick={() => onNavigate(item.id)}>
            <Icon name={item.icon} size={17} /><span>{item.label}</span>
          </button>
        ))}
      </nav>
      <div className="bottom-actions">
        <button className="nav-item" onClick={() => onNavigate('settings')}><Icon name="settings" size={17}/><span>{strings.settings}</span></button>
        <button className="mode-toggle" onClick={onThemeToggle} aria-label="Toggle colour mode">
          <span className={!dark ? 'selected' : ''}><Icon name="sun" size={14}/></span>
          <span className={dark ? 'selected' : ''}><Icon name="moon" size={14}/></span>
        </button>
        <button className="my-profile" onClick={() => onNavigate('profile')}>
          <Avatar name={user.name} src={user.avatar} online size="sm"/>
          <span><strong>{user.name}</strong><small>{user.handle}</small></span>
        </button>
      </div>
    </div>
  )
}
