type AvatarProps = { name: string; src?: string; size?: 'sm' | 'md' | 'lg' | 'xl'; online?: boolean; className?: string }

export function Avatar({ name, src, size = 'md', online, className = '' }: AvatarProps) {
  return (
    <div className={`avatar avatar-${size} ${className}`} aria-label={name}>
      {src ? <img src={src} alt={name} /> : <span>{name.split(' ').map(n => n[0]).slice(0, 2).join('')}</span>}
      {online !== undefined && <i className={online ? 'online-dot' : 'offline-dot'} />}
    </div>
  )
}
