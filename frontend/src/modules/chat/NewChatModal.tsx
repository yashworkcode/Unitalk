import { useState, type FormEvent } from 'react'
import { Icon } from '../shared/Icon'
import type { NewChatModalStrings } from '../i18n/translations'

type NewChatModalProps = { onClose: () => void; onCreate: (values: { username: string; language: string }) => void; defaultLanguage: string; strings: NewChatModalStrings }

// In production, this form should look up a user ID against the user discovery endpoint before creation.
export function NewChatModal({ onClose, onCreate, defaultLanguage, strings }: NewChatModalProps) {
  const [username, setUsername] = useState('')
  const [language, setLanguage] = useState(defaultLanguage)
  const submit = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); onCreate({ username, language }) }
  return <div className="modal-backdrop" onMouseDown={onClose}><section className="modal new-chat-modal" onMouseDown={event => event.stopPropagation()}><header><div><p className="eyebrow">{strings.addByUsername}</p><h2>{strings.startChat}</h2></div><button onClick={onClose}><Icon name="x"/></button></header><form onSubmit={submit}><p>{strings.description}</p><label><span>{strings.usernameLabel}</span><div className="new-chat-username"><i>@</i><input value={username.replace('@', '')} onChange={event => setUsername(event.target.value.replace('@', ''))} required minLength={3} placeholder={strings.usernameLabel.toLowerCase()} autoFocus /></div></label><label><span>{strings.translateLabel}</span><select value={language} onChange={event => setLanguage(event.target.value)}><option>English</option><option>Hindi</option><option>Spanish</option><option>Portuguese</option><option>French</option><option>Japanese</option><option>Arabic</option></select></label><button className="primary-auth-button" type="submit">{strings.addFriendButton} <Icon name="chevronRight" size={17}/></button></form></section></div>
}
