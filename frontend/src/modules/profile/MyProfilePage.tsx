import { useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { Avatar } from '../shared/Avatar'
import { Icon } from '../shared/Icon'
import type { currentUser } from '../data/mockData'

type Profile = typeof currentUser
type MyProfilePageProps = { profile: Profile; onSave: (profile: Profile) => void; onLogout: () => void; onBack: () => void }

// Client-side profile editor. Send the selected file to object storage and persist fields through a profile API in production.
export function MyProfilePage({ profile, onSave, onLogout, onBack }: MyProfilePageProps) {
  const [draft, setDraft] = useState(profile)
  const [photoLabel, setPhotoLabel] = useState('')
  const fileInput = useRef<HTMLInputElement>(null)
  const choosePhoto = () => fileInput.current?.click()
  const photoChanged = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    setDraft({ ...draft, avatar: URL.createObjectURL(file) })
    setPhotoLabel(file.name)
  }
  const submit = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); onSave(draft) }
  return (
    <main className="my-profile-page">
      <header className="profile-page-top"><button onClick={onBack}><Icon name="chevronRight" size={18}/><span>Back to messages</span></button><span>Account settings</span></header>
      <div className="profile-page-scroll"><section className="profile-page-intro"><p className="eyebrow">YOUR UNITALK IDENTITY</p><h1>My profile</h1><p>Make your profile feel like you. Your name and photo are visible to your friends.</p></section>
        <form className="profile-edit-card" onSubmit={submit}>
          <div className="profile-cover"><div className="cover-art"/></div>
          <div className="profile-photo-row"><div className="profile-photo-wrap"><Avatar name={draft.name} src={draft.avatar} size="xl" online/><button type="button" className="photo-edit" onClick={choosePhoto} aria-label="Change profile photo"><Icon name="image" size={15}/></button><input ref={fileInput} onChange={photoChanged} accept="image/*" type="file" hidden/></div><div><h2>Profile photo</h2><p>JPG, PNG or WEBP. Recommended size: 400 × 400 px.</p><div className="photo-actions"><button type="button" className="outline-button" onClick={choosePhoto}><Icon name="image" size={15}/> Upload photo</button>{photoLabel && <small>{photoLabel}</small>}</div></div></div>
          <div className="profile-form-grid"><label><span>Full name</span><input value={draft.name} onChange={event => setDraft({ ...draft, name: event.target.value })} required minLength={2}/></label><label><span>Username</span><div className="profile-username"><i>@</i><input value={draft.handle.replace('@', '')} disabled/></div></label></div>
          <div className="profile-id-box"><span className="id-icon"><Icon name="copy" size={17}/></span><div><b>Your User ID</b><p>{profile.userId} · Share this ID so people can add you quickly.</p></div><button type="button" onClick={() => navigator.clipboard?.writeText(profile.userId)}><Icon name="copy" size={16}/> Copy</button></div>
          <footer className="profile-edit-footer"><button type="button" className="cancel-edit" onClick={() => { setDraft(profile); setPhotoLabel('') }}>Discard changes</button><button className="save-profile" type="submit"><Icon name="check" size={17}/> Save changes</button></footer>
        </form>
        <section className="account-danger"><div><span className="danger-icon"><Icon name="logout" size={18}/></span><span><b>Sign out of UniTalk</b><small>You can sign back in at any time.</small></span></div><button onClick={onLogout}>Log out</button></section>
      </div>
    </main>
  )
}
