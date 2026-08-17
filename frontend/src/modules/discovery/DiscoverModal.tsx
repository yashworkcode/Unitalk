import { useState } from 'react'
import { Avatar } from '../shared/Avatar'
import { Icon } from '../shared/Icon'

type DiscoverModalProps = { onClose: () => void; onToast: (message: string) => void }

// Discovery UI exposes user-id, handle and name search before it is backed by the user directory endpoint.
export function DiscoverModal({ onClose, onToast }: DiscoverModalProps) {
  const [query, setQuery] = useState('')
  const [sent, setSent] = useState<string[]>([])
  const users: Array<{ name: string; handle: string; id: string; language: string; avatar?: string; status: string }> = []
  const add = (name: string) => { setSent([...sent, name]); onToast(`Friend request sent to ${name}`) }
  return <div className="modal-backdrop" onMouseDown={onClose}><section className="modal discover-modal" onMouseDown={e => e.stopPropagation()}><header><div><p className="eyebrow">CONNECT ON UNITALK</p><h2>Find by username</h2></div><button onClick={onClose}><Icon name="x"/></button></header><label className="discover-search"><Icon name="search"/><input autoFocus value={query} onChange={e => setQuery(e.target.value)} placeholder="Search username" /></label><p className="section-label">USERNAME SEARCH</p><div className="discover-results">{users.length ? users.map(user => <article key={user.id} className="discover-user"><Avatar name={user.name} src={user.avatar} size="lg"/><div><strong>{user.name}</strong><small>{user.handle} · {user.language}</small><p>{user.status}</p></div><button className={sent.includes(user.name) ? 'request-sent' : 'add-friend'} onClick={() => !sent.includes(user.name) && add(user.name)}>{sent.includes(user.name) ? <><Icon name="check" size={16}/> Sent</> : <><Icon name="plus" size={16}/> Add</>}</button></article>) : <div className="directory-empty"><Icon name="search" size={19}/><p>{query ? 'No matching username was found.' : 'Search results will appear here once your username directory is connected.'}</p></div>}</div></section></div>
}
