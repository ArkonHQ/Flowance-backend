

export interface TeamContext {
  teamId: number
  teamSlug: string
  membershipId: number
  userId: number
  role: 'admin' | 'member'
  isOwner: boolean
}
