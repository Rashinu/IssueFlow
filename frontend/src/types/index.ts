export interface User {
  id: string
  name: string
  email: string
  role: string
}

export interface Hotel {
  id: string
  name: string
  address: string
  issueCount: number
}

export type IssueStatus = 'New' | 'Investigating' | 'WaitingCustomer' | 'AssignedDeveloper' | 'Resolved' | 'Closed'
export type Priority = 'Low' | 'Medium' | 'High' | 'Critical'

export interface Issue {
  id: string
  title: string
  description: string
  status: IssueStatus
  priority: Priority
  hotelName: string
  assignedUserName?: string
  createdAt: string
}

export interface Comment {
  id: string
  content: string
  authorName: string
  createdAt: string
}

export interface IssueDetail {
  id: string
  title: string
  description: string
  status: IssueStatus
  priority: Priority
  hotelId: string
  hotelName: string
  assignedUserId?: string
  assignedUserName?: string
  createdAt: string
  comments: Comment[]
}

export interface HotelStat {
  hotelName: string
  count: number
}

export interface StatusStat {
  status: string
  count: number
}

export interface ReportDto {
  period: string
  totalIssues: number
  newIssues: number
  resolvedIssues: number
  criticalIssues: number
  byHotel: HotelStat[]
  byStatus: StatusStat[]
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResult {
  token: string
  userName: string
  role: string
}
