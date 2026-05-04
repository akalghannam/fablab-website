-- ============================================================
-- FabLab Club — Supabase Database Schema (Full + Migration)
-- Run in: Supabase Dashboard > SQL Editor
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- MIGRATION: Add new columns to existing users table
-- (Safe to run on fresh DB too — IF NOT EXISTS guards)
-- ============================================================
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS is_super_admin BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS account_type   TEXT DEFAULT 'audience'
                                          CHECK (account_type IN ('audience','member','super_admin')),
  ADD COLUMN IF NOT EXISTS username       TEXT UNIQUE;

-- ============================================================
-- TABLES
-- ============================================================

CREATE TABLE IF NOT EXISTS public.users (
  id            UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email         TEXT NOT NULL,
  full_name     TEXT,
  role          TEXT DEFAULT 'member' CHECK (role IN ('admin','member','guest')),
  phone         TEXT,
  is_active     BOOLEAN DEFAULT true,
  is_super_admin BOOLEAN DEFAULT false,
  account_type  TEXT DEFAULT 'audience'
                CHECK (account_type IN ('audience','member','super_admin')),
  username      TEXT UNIQUE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

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

CREATE TABLE IF NOT EXISTS public.event_registrations (
  id            UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_id      UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  name          TEXT NOT NULL,
  email         TEXT NOT NULL,
  phone         TEXT,
  registered_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, email)
);

CREATE TABLE IF NOT EXISTS public.attendance_logs (
  id         UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id    UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  check_in   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  check_out  TIMESTAMPTZ,
  notes      TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.lab_status_reports (
  id                  UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id             UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  attendance_log_id   UUID REFERENCES public.attendance_logs(id) ON DELETE SET NULL,
  type                TEXT NOT NULL CHECK (type IN ('check-in','check-out')),
  equipment_condition TEXT CHECK (equipment_condition IN ('excellent','good','fair','poor')),
  cleanliness_rating  INTEGER CHECK (cleanliness_rating BETWEEN 1 AND 5),
  notes               TEXT,
  photos              TEXT[],
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- Current lab operational status (latest row = current state)
CREATE TABLE IF NOT EXISTS public.lab_status (
  id         UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  status     TEXT NOT NULL DEFAULT 'red' CHECK (status IN ('red','yellow','green')),
  notes      TEXT,
  changed_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  changed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Member permissions (one row per permission per member)
CREATE TABLE IF NOT EXISTS public.member_permissions (
  id         UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id    UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  permission TEXT NOT NULL CHECK (permission IN
             ('CREATE_MEMBERS','CHANGE_LAB_STATUS','MANAGE_EVENTS','VIEW_AUDIENCE')),
  granted_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, permission)
);

CREATE TABLE IF NOT EXISTS public.storage_cleanup_logs (
  id             UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  files_deleted  INTEGER DEFAULT 0,
  space_freed_mb DECIMAL(10,2) DEFAULT 0,
  cleaned_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SEED: Default lab status (red = closed)
-- ============================================================
INSERT INTO public.lab_status (status, notes, changed_at)
SELECT 'red', 'الحالة الافتراضية', NOW()
WHERE NOT EXISTS (SELECT 1 FROM public.lab_status);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_events_date         ON public.events(date);
CREATE INDEX IF NOT EXISTS idx_attendance_user      ON public.attendance_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_attendance_checkin   ON public.attendance_logs(check_in);
CREATE INDEX IF NOT EXISTS idx_lab_status_created   ON public.lab_status(changed_at DESC);
CREATE INDEX IF NOT EXISTS idx_member_perms_user    ON public.member_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_lab_report_user      ON public.lab_status_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_event_reg_event      ON public.event_registrations(event_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE public.users               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_logs     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_status_reports  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_status          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.member_permissions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.storage_cleanup_logs ENABLE ROW LEVEL SECURITY;

-- Helper functions
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND is_super_admin = true
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.has_permission(perm TEXT)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.member_permissions
    WHERE user_id = auth.uid() AND permission = perm
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ── users ──────────────────────────────────────────────────
DROP POLICY IF EXISTS "users_select_own"  ON public.users;
DROP POLICY IF EXISTS "users_insert_own"  ON public.users;
DROP POLICY IF EXISTS "users_update_own"  ON public.users;
DROP POLICY IF EXISTS "admin_users_all"   ON public.users;

CREATE POLICY "users_select" ON public.users
  FOR SELECT USING (
    id = auth.uid() OR public.is_admin() OR public.is_super_admin()
  );
CREATE POLICY "users_insert_own" ON public.users
  FOR INSERT WITH CHECK (id = auth.uid());
CREATE POLICY "users_update" ON public.users
  FOR UPDATE USING (
    id = auth.uid() OR public.is_admin() OR public.is_super_admin()
  );
CREATE POLICY "users_delete_super" ON public.users
  FOR DELETE USING (public.is_super_admin() AND is_super_admin = false);

-- ── events ─────────────────────────────────────────────────
DROP POLICY IF EXISTS "events_select_all"   ON public.events;
DROP POLICY IF EXISTS "events_insert_admin" ON public.events;
DROP POLICY IF EXISTS "events_update_admin" ON public.events;
DROP POLICY IF EXISTS "events_delete_admin" ON public.events;

CREATE POLICY "events_select_all" ON public.events FOR SELECT USING (true);
CREATE POLICY "events_insert_auth" ON public.events
  FOR INSERT WITH CHECK (
    public.is_admin() OR public.is_super_admin() OR public.has_permission('MANAGE_EVENTS')
  );
CREATE POLICY "events_update_auth" ON public.events
  FOR UPDATE USING (
    public.is_admin() OR public.is_super_admin() OR public.has_permission('MANAGE_EVENTS')
  );
CREATE POLICY "events_delete_auth" ON public.events
  FOR DELETE USING (
    public.is_admin() OR public.is_super_admin() OR public.has_permission('MANAGE_EVENTS')
  );

-- ── event_registrations ────────────────────────────────────
DROP POLICY IF EXISTS "registrations_select_admin" ON public.event_registrations;
DROP POLICY IF EXISTS "registrations_insert_all"   ON public.event_registrations;

CREATE POLICY "registrations_select" ON public.event_registrations
  FOR SELECT USING (
    public.is_admin() OR public.is_super_admin() OR public.has_permission('VIEW_AUDIENCE')
  );
CREATE POLICY "registrations_insert_all" ON public.event_registrations
  FOR INSERT WITH CHECK (true);

-- ── attendance_logs ────────────────────────────────────────
CREATE POLICY "attendance_select" ON public.attendance_logs
  FOR SELECT USING (user_id = auth.uid() OR public.is_admin() OR public.is_super_admin());
CREATE POLICY "attendance_insert_own" ON public.attendance_logs
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "attendance_update" ON public.attendance_logs
  FOR UPDATE USING (user_id = auth.uid() OR public.is_admin() OR public.is_super_admin());

-- ── lab_status_reports ─────────────────────────────────────
CREATE POLICY "lab_report_select" ON public.lab_status_reports
  FOR SELECT USING (user_id = auth.uid() OR public.is_admin() OR public.is_super_admin());
CREATE POLICY "lab_report_insert_own" ON public.lab_status_reports
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "lab_report_update_admin" ON public.lab_status_reports
  FOR UPDATE USING (public.is_admin() OR public.is_super_admin());

-- ── lab_status (current status) ────────────────────────────
CREATE POLICY "lab_status_select_all" ON public.lab_status
  FOR SELECT USING (true);
CREATE POLICY "lab_status_insert_auth" ON public.lab_status
  FOR INSERT WITH CHECK (
    public.is_super_admin() OR public.is_admin() OR public.has_permission('CHANGE_LAB_STATUS')
  );

-- ── member_permissions ─────────────────────────────────────
CREATE POLICY "perms_select" ON public.member_permissions
  FOR SELECT USING (
    user_id = auth.uid() OR public.is_super_admin() OR public.is_admin()
    OR public.has_permission('CREATE_MEMBERS')
  );
CREATE POLICY "perms_insert" ON public.member_permissions
  FOR INSERT WITH CHECK (
    public.is_super_admin() OR public.has_permission('CREATE_MEMBERS')
  );
CREATE POLICY "perms_delete" ON public.member_permissions
  FOR DELETE USING (
    public.is_super_admin() OR public.has_permission('CREATE_MEMBERS')
  );

-- ── storage_cleanup_logs ───────────────────────────────────
CREATE POLICY "cleanup_select_admin" ON public.storage_cleanup_logs
  FOR SELECT USING (public.is_admin() OR public.is_super_admin());
CREATE POLICY "cleanup_insert" ON public.storage_cleanup_logs
  FOR INSERT WITH CHECK (true);

-- ============================================================
-- STORAGE BUCKETS
-- ============================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'lab-status-photos', 'lab-status-photos', true, 10485760,
  ARRAY['image/jpeg','image/png','image/webp','image/gif']
) ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'event-images', 'event-images', true, 10485760,
  ARRAY['image/jpeg','image/png','image/webp','image/gif']
) ON CONFLICT (id) DO NOTHING;

CREATE POLICY "lab_photos_select" ON storage.objects
  FOR SELECT USING (bucket_id = 'lab-status-photos');
CREATE POLICY "lab_photos_insert" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'lab-status-photos' AND auth.role() = 'authenticated');
CREATE POLICY "lab_photos_delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'lab-status-photos' AND (public.is_admin() OR public.is_super_admin()));

CREATE POLICY "event_images_select" ON storage.objects
  FOR SELECT USING (bucket_id = 'event-images');
CREATE POLICY "event_images_insert" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'event-images' AND auth.role() = 'authenticated');
CREATE POLICY "event_images_delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'event-images' AND (public.is_admin() OR public.is_super_admin() OR public.has_permission('MANAGE_EVENTS')));

-- ============================================================
-- TRIGGER: auto-create user profile on signup
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, account_type)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    COALESCE(NEW.raw_user_meta_data->>'account_type', 'audience')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- SUPER ADMIN SETUP
-- Instructions:
-- 1. Create auth users via Supabase Dashboard > Authentication > Users:
--    Email: president@fablabkfupm.com  Password: FabLab@KFUPM
--    Email: developer@fablabkfupm.com  Password: FabLab@KFUPM
-- 2. Then run the UPDATE below to elevate them:
-- ============================================================
UPDATE public.users
SET
  is_super_admin = true,
  account_type   = 'super_admin',
  role           = 'admin',
  full_name      = CASE
    WHEN email = 'president@fablabkfupm.com' THEN 'رئيس النادي'
    WHEN email = 'developer@fablabkfupm.com'  THEN 'المطور'
  END
WHERE email IN ('president@fablabkfupm.com', 'developer@fablabkfupm.com');
