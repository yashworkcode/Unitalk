export type Attachment = {
  kind: 'image' | 'video' | 'audio'
  name: string
  url: string
}

export type Chat = {
  id: string
  name: string
  handle: string
  avatar?: string
  online?: boolean
  language: string
  native?: string
  preview: string
  time: string
  unread?: number
  otherUserId?: string
}

export type Message = {
  id: string
  from: 'me' | 'them'
  text: string
  time: string
  original?: string
  translated?: boolean
  reaction?: string
  attachment?: Attachment
}

export const currentUser = {
  name: 'Ari Morgan',
  handle: '@arimorgan',
  userId: 'UT-28491',
  avatar: 'https://i.pravatar.cc/160?img=47',
}
