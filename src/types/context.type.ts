

export interface TeamContext {
  teamId: number
  teamSlug: string
  membershipId: number
  userId: string 
  role: 'admin' | 'member'
  isOwner: boolean
}
