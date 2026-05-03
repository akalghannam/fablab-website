-- ============================================================
-- FabLab Club — Supabase Database Schema
-- Run this in: Supabase Dashboard > SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABLES
-- ============================================================

-- Users (extends auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id          UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email       TEXT NOT NULL,
  full_name   TEXT,
  role        TEXT DEFAULT 'member' CHECK (role IN ('admin', 'member', 'guest')),
  phone       TEXT,
  is_active   BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Events
CREATE TABLE IF NOT EXISTS public.events (
  id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title       TEXT NOT NULL,
  description TEXT,
  date        DATE NOT NULL,
  time        TIME NOT NULL,
  location    TEXT,
  capacity    INTEGER,
  image_url   TEXT,
  created_by  UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Event Registrations
CREATE TABLE IF NOT EXISTS public.event_registrations (
  id            UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_id      UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  name          TEXT NOT NULL,
  email         TEXT NOT NULL,
  phone         TEXT,
  registered_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, email)
);

-- Attendance Logs
CREATE TABLE IF NOT EXISTS public.attendance_logs (
  id         UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id    UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  check_in   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  check_out  TIMESTAMPTZ,
  notes      TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lab Status Reports
CREATE TABLE IF NOT EXISTS public.lab_status_reports (
  id                  UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id             UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  attendance_log_id   UUID REFERENCES public.attendance_logs(id) ON DELETE SET NULL,
  type                TEXT NOT NULL CHECK (type IN ('check-in', 'check-out')),
  equipment_condition TEXT CHECK (equipment_condition IN ('excellent', 'good', 'fair', 'poor')),
  cleanliness_rating  INTEGER CHECK (cleanliness_rating BETWEEN 1 AND 5),
  notes               TEXT,
  photos              TEXT[],
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- Storage Cleanup Logs
CREATE TABLE IF NOT EXISTS public.storage_cleanup_logs (
  id             UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  files_deleted  INTEGER DEFAULT 0,
  space_freed_mb DECIMAL(10, 2) DEFAULT 0,
  cleaned_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_events_date ON public.events(date);
CREATE INDEX IF NOT EXISTS idx_attendance_user ON public.attendance_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_attendance_checkin ON public.attendance_logs(check_in);
CREATE INDEX IF NOT EXISTS idx_lab_status_user ON public.lab_status_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_lab_status_created ON public.lab_status_reports(created_at);
CREATE INDEX IF NOT EXISTS idx_event_reg_event ON public.event_registrations(event_id);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_status_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.storage_cleanup_logs ENABLE ROW LEVEL SECURITY;

-- Helper: check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ── users ──────────────────────────────────────────────────
CREATE POLICY "users_select_own" ON public.users
  FOR SELECT USING (id = auth.uid() OR public.is_admin());

CREATE POLICY "users_insert_own" ON public.users
  FOR INSERT WITH CHECK (id = auth.uid());

CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE USING (id = auth.uid() OR public.is_admin());

CREATE POLICY "admin_users_all" ON public.users
  FOR ALL USING (public.is_admin());

-- ── events ─────────────────────────────────────────────────
CREATE POLICY "events_select_all" ON public.events
  FOR SELECT USING (true);

CREATE POLICY "events_insert_admin" ON public.events
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "events_update_admin" ON public.events
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "events_delete_admin" ON public.events
  FOR DELETE USING (public.is_admin());

-- ── event_registrations ────────────────────────────────────
CREATE POLICY "registrations_select_admin" ON public.event_registrations
  FOR SELECT USING (public.is_admin());

CREATE POLICY "registrations_insert_all" ON public.event_registrations
  FOR INSERT WITH CHECK (true);

-- ── attendance_logs ────────────────────────────────────────
CREATE POLICY "attendance_select_own_or_admin" ON public.attendance_logs
  FOR SELECT USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "attendance_insert_own" ON public.attendance_logs
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "attendance_update_own_or_admin" ON public.attendance_logs
  FOR UPDATE USING (user_id = auth.uid() OR public.is_admin());

-- ── lab_status_reports ─────────────────────────────────────
CREATE POLICY "lab_status_select_own_or_admin" ON public.lab_status_reports
  FOR SELECT USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "lab_status_insert_own" ON public.lab_status_reports
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "lab_status_update_admin" ON public.lab_status_reports
  FOR UPDATE USING (public.is_admin());

-- ── storage_cleanup_logs ───────────────────────────────────
CREATE POLICY "cleanup_logs_select_admin" ON public.storage_cleanup_logs
  FOR SELECT USING (public.is_admin());

CREATE POLICY "cleanup_logs_insert_service" ON public.storage_cleanup_logs
  FOR INSERT WITH CHECK (true);

-- ============================================================
-- STORAGE BUCKET
-- ============================================================

-- Create storage bucket for lab status photos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'lab-status-photos',
  'lab-status-photos',
  true,
  10485760,  -- 10 MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS
CREATE POLICY "lab_photos_select_all" ON storage.objects
  FOR SELECT USING (bucket_id = 'lab-status-photos');

CREATE POLICY "lab_photos_insert_auth" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'lab-status-photos' AND auth.role() = 'authenticated'
  );

CREATE POLICY "lab_photos_delete_admin" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'lab-status-photos' AND public.is_admin()
  );

-- ============================================================
-- TRIGGER: auto-create user profile on signup
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
