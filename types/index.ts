export type UserRole = 'admin' | 'member' | 'guest'
export type ReportType = 'check-in' | 'check-out'
export type EquipmentCondition = 'excellent' | 'good' | 'fair' | 'poor'

export interface User {
  id: string
  email: string
  full_name: string | null
  role: UserRole
  phone: string | null
  is_active: boolean
  created_at: string
}

export interface Event {
  id: string
  title: string
  description: string | null
  date: string
  time: string
  location: string | null
  capacity: number | null
  image_url: string | null
  created_by: string | null
  created_at: string
  registrations_count?: number
}

export interface EventRegistration {
  id: string
  event_id: string
  name: string
  email: string
  phone: string | null
  registered_at: string
  events?: Event
}

export interface AttendanceLog {
  id: string
  user_id: string
  check_in: string
  check_out: string | null
  notes: string | null
  created_at: string
  users?: User
}

export interface LabStatusReport {
  id: string
  user_id: string
  attendance_log_id: string | null
  type: ReportType
  equipment_condition: EquipmentCondition | null
  cleanliness_rating: number | null
  notes: string | null
  photos: string[] | null
  created_at: string
  users?: User
}

export interface StorageCleanupLog {
  id: string
  files_deleted: number
  space_freed_mb: number
  cleaned_at: string
}

export interface DashboardStats {
  totalMembers: number
  upcomingEvents: number
  todayAttendance: number
  openLabStatus: number
  lastCleanup: StorageCleanupLog | null
}
