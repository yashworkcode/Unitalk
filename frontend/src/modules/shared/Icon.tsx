import type { ReactNode, SVGProps } from 'react'

type IconName =
  | 'search' | 'plus' | 'more' | 'smile' | 'paperclip' | 'send' | 'phone'
  | 'video' | 'bell' | 'settings' | 'users' | 'message' | 'compass'
  | 'bookmark' | 'archive' | 'chevronDown' | 'chevronRight' | 'check'
  | 'checkDouble' | 'copy' | 'share' | 'globe' | 'moon' | 'sun' | 'x'
  | 'menu' | 'reply' | 'heart' | 'sliders' | 'logout' | 'image' | 'sparkle'
  | 'mic' | 'stop'

export function Icon({ name, size = 20, ...props }: { name: IconName; size?: number } & SVGProps<SVGSVGElement>) {
  const common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.9, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, ...props }
  const paths: Record<IconName, ReactNode> = {
    search: <><circle cx="11" cy="11" r="6.8"/><path d="m16 16 4 4"/></>,
    plus: <><path d="M12 5v14M5 12h14"/></>,
    more: <><circle cx="5" cy="12" r="1" fill="currentColor"/><circle cx="12" cy="12" r="1" fill="currentColor"/><circle cx="19" cy="12" r="1" fill="currentColor"/></>,
    smile: <><circle cx="12" cy="12" r="9"/><path d="M8 14.5s1.3 2 4 2 4-2 4-2M9 9h.01M15 9h.01"/></>,
    paperclip: <path d="m20.3 11.6-8.4 8.4a5.1 5.1 0 0 1-7.2-7.2l8.8-8.8a3.5 3.5 0 1 1 5 5L9.7 17.8a1.9 1.9 0 0 1-2.7-2.7l8.1-8.1"/>,
    send: <><path d="m21 3-7.8 18-3.6-8.4L3 9l18-6Z"/><path d="m9.6 12.6 4.8-4.5"/></>,
    phone: <path d="M5 4.8 7.7 4l1.5 3.8-1.7 1.5a14.5 14.5 0 0 0 7.2 7.2l1.5-1.7L20 16.3l-.8 2.7c-.3 1-1.2 1.6-2.2 1.5C9.7 19.8 4.2 14.3 3.5 7c-.1-1 .5-1.9 1.5-2.2Z"/>,
    video: <><rect x="3" y="6" width="12" height="12" rx="2"/><path d="m15 10 5-3v10l-5-3"/></>,
    bell: <><path d="M18 9a6 6 0 1 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/></>,
    settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1-2 2-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5v.2h-3v-.2a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.8.3l-.1.1-2-2 .1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H5.7v-3h.2a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.8L7 8.1l2-2 .1.1a1.6 1.6 0 0 0 1.8.3 1.6 1.6 0 0 0 1-1.5v-.2h3V5a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1 2 2-.1.1a1.6 1.6 0 0 0-.3 1.8 1.6 1.6 0 0 0 1.5 1h.2v3h-.2a1.6 1.6 0 0 0-1.5 1Z"/></>,
    users: <><path d="M16 20v-1.5a4.5 4.5 0 0 0-4.5-4.5h-4A4.5 4.5 0 0 0 3 18.5V20"/><circle cx="9.5" cy="7" r="3.2"/><path d="M17 11a3 3 0 1 0-1.7-5.5M21 20v-1.5a4.5 4.5 0 0 0-2.8-4.2"/></>,
    message: <path d="M20 11.3a7.5 7.5 0 0 1-8 7.5 8.8 8.8 0 0 1-3.5-.7L4 20l1.4-3.8A7.3 7.3 0 0 1 4 11.3a7.5 7.5 0 0 1 8-7.5 7.5 7.5 0 0 1 8 7.5Z"/>,
    compass: <><circle cx="12" cy="12" r="8.5"/><path d="m15.5 8.5-2.2 4.8-4.8 2.2 2.2-4.8 4.8-2.2Z"/></>,
    bookmark: <path d="M6 4.5A1.5 1.5 0 0 1 7.5 3h9A1.5 1.5 0 0 1 18 4.5V21l-6-3.7L6 21V4.5Z"/>,
    archive: <><path d="M4 7h16v13H4zM3 3h18v4H3z"/><path d="M10 12h4"/></>,
    chevronDown: <path d="m6 9 6 6 6-6"/>,
    chevronRight: <path d="m9 18 6-6-6-6"/>,
    check: <path d="m5 12 4 4L19 6"/>,
    checkDouble: <><path d="m2 12 4 4L16 6"/><path d="m8 12 4 4 10-10"/></>,
    copy: <><rect x="8" y="8" width="11" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h2"/></>,
    share: <><circle cx="18" cy="5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="19" r="2.5"/><path d="m8.2 10.8 7.6-4.5M8.2 13.2l7.6 4.5"/></>,
    globe: <><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></>,
    moon: <path d="M20 15.7A8.5 8.5 0 0 1 8.3 4 8.5 8.5 0 1 0 20 15.7Z"/>,
    sun: <><circle cx="12" cy="12" r="3.5"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></>,
    x: <path d="m6 6 12 12M18 6 6 18"/>,
    menu: <path d="M4 7h16M4 12h16M4 17h16"/>,
    reply: <><path d="m9 17-5-5 5-5"/><path d="M4 12h9a6 6 0 0 1 6 6"/></>,
    heart: <path d="M20.8 8.5c0 5.6-8.8 10.1-8.8 10.1S3.2 14.1 3.2 8.5A4.5 4.5 0 0 1 12 7a4.5 4.5 0 0 1 8.8 1.5Z"/>,
    sliders: <><path d="M4 6h16M4 12h16M4 18h16"/><circle cx="9" cy="6" r="2" fill="var(--panel)"/><circle cx="15" cy="12" r="2" fill="var(--panel)"/><circle cx="8" cy="18" r="2" fill="var(--panel)"/></>,
    logout: <><path d="M10 5H5v14h5M14 8l4 4-4 4M18 12H9"/></>,
    image: <><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8.5" cy="9" r="1.3"/><path d="m21 15-4.5-4.5L7 20"/></>,
    sparkle: <path d="m12 3 1.1 4.9L18 9l-4.9 1.1L12 15l-1.1-4.9L6 9l4.9-1.1L12 3ZM19 15l.5 2.5L22 18l-2.5.5L19 21l-.5-2.5L16 18l2.5-.5L19 15Z"/>,
    mic: <><rect x="8" y="3" width="8" height="12" rx="4"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3M8.5 21h7"/></>,
    stop: <rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor" stroke="none"/>,
  }
  return <svg {...common}>{paths[name]}</svg>
}
