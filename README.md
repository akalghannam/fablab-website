# نادي فاب لاب — FabLab Club

منصة إدارة نادي فاب لاب — تسجيل حضور، إدارة فعاليات، وتوثيق حالة المختبر.

---

## متطلبات التشغيل

- [Node.js 18+](https://nodejs.org/)
- [npm](https://www.npmjs.com/)
- حساب [Supabase](https://supabase.com)
- حساب [Vercel](https://vercel.com) (للنشر)

---

## خطوات الإعداد

### 1. تثبيت المتطلبات

```bash
npm install
```

### 2. إعداد الخطوط

قم بتنزيل الخطوط ووضعها في مجلد `public/fonts/`:

- **Sansation** (الخط الإنجليزي):
  - `Sansation_Regular.ttf`
  - `Sansation_Bold.ttf`
  - `Sansation_Light.ttf`
  - رابط التنزيل: [dafont.com/sansation](https://www.dafont.com/sansation.font)

- **Hacen Tunisia** (الخط العربي):
  - `HacenTunisia.ttf`
  - رابط التنزيل: [hacen.net](http://www.hacen.net/)

> **ملاحظة:** في حالة عدم توفر الخطوط، سيستخدم التطبيق خطوط Cairo وInter كبديل.

### 3. إعداد الشعار

ضع ملف الشعار `logo.svg` في مجلد `public/`. الملف الحالي هو شعار مؤقت — استبدله بالشعار الرسمي.

### 4. إعداد Supabase

#### أ. إنشاء مشروع Supabase
1. اذهب إلى [supabase.com](https://supabase.com) وأنشئ مشروعاً جديداً
2. احفظ `SUPABASE_URL` و `SUPABASE_ANON_KEY` و `SUPABASE_SERVICE_ROLE_KEY`

#### ب. تشغيل قاعدة البيانات
1. اذهب إلى **SQL Editor** في لوحة تحكم Supabase
2. انسخ محتوى ملف `supabase/schema.sql`
3. شغّله بالكامل

#### ج. إعداد الـ Storage
يتم إنشاء Bucket تلقائياً عند تشغيل `schema.sql`. تأكد من وجود bucket باسم `lab-status-photos`.

### 5. متغيرات البيئة

انسخ ملف `.env.example` إلى `.env.local`:

```bash
cp .env.example .env.local
```

أضف قيمك:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 6. تشغيل المشروع محلياً

```bash
npm run dev
```

افتح [http://localhost:3000](http://localhost:3000)

---

## إعداد Edge Functions (اختياري)

### دالة تنظيف التخزين

```bash
# تثبيت Supabase CLI
npm install -g supabase

# تسجيل الدخول
supabase login

# نشر الدالة
supabase functions deploy cleanup-storage --project-ref your-project-ref
```

#### جدولة تلقائية (أول كل شهر)
في **Supabase Dashboard > Database > Extensions**، فعّل `pg_cron` ثم شغّل:

```sql
SELECT cron.schedule(
  'monthly-storage-cleanup',
  '0 0 1 * *',
  $$
    SELECT net.http_post(
      url := 'https://your-project.supabase.co/functions/v1/cleanup-storage',
      headers := '{"Authorization": "Bearer YOUR_CRON_SECRET"}'::jsonb
    );
  $$
);
```

### دالة إرسال تأكيد التسجيل

```bash
supabase functions deploy send-confirmation --project-ref your-project-ref
```

#### إعداد Database Webhook
في **Supabase Dashboard > Database > Webhooks**:
- **Table:** `event_registrations`
- **Events:** `INSERT`
- **URL:** `https://your-project.supabase.co/functions/v1/send-confirmation`

#### إعداد Resend (إرسال الإيميلات)
1. أنشئ حساباً على [resend.com](https://resend.com)
2. احصل على API Key
3. أضفه كـ Secret في Supabase:

```bash
supabase secrets set RESEND_API_KEY=your-resend-api-key
```

---

## نشر على Vercel

### 1. ربط المستودع بـ Vercel
```bash
npm install -g vercel
vercel
```

### 2. إضافة متغيرات البيئة
في **Vercel Dashboard > Settings > Environment Variables**، أضف:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_SITE_URL` (مثال: `https://fablab.vercel.app`)

### 3. إعداد URL إعادة التوجيه في Supabase
في **Supabase Dashboard > Authentication > URL Configuration**:
- **Site URL:** `https://your-domain.vercel.app`
- **Redirect URLs:** `https://your-domain.vercel.app/auth/callback`

---

## إنشاء حساب المدير (Admin)

بعد إنشاء حسابك العادي، شغّل هذا في SQL Editor:

```sql
UPDATE public.users
SET role = 'admin'
WHERE email = 'your-email@example.com';
```

---

## هيكل المشروع

```
fablab-website/
├── app/                    # صفحات Next.js (App Router)
│   ├── actions/           # Server Actions
│   ├── admin/             # لوحة إدارة
│   ├── auth/callback/     # معالج OAuth
│   ├── dashboard/         # لوحة العضو
│   ├── events/            # صفحات الفعاليات
│   ├── forgot-password/   # نسيان كلمة المرور
│   ├── login/             # تسجيل الدخول
│   ├── reset-password/    # إعادة تعيين كلمة المرور
│   └── signup/            # إنشاء حساب
├── components/            # مكونات React
│   └── ui/               # مكونات واجهة المستخدم
├── lib/supabase/          # إعدادات Supabase
├── public/
│   ├── fonts/             # الخطوط (أضفها يدوياً)
│   └── logo.svg          # الشعار
├── supabase/
│   ├── schema.sql         # قاعدة البيانات
│   └── functions/         # Edge Functions
├── types/                 # TypeScript types
└── middleware.ts          # حماية المسارات
```

---

## الأدوار والصلاحيات

| الصفحة | زائر | عضو | مدير |
|--------|------|-----|------|
| الصفحة الرئيسية | ✅ | ✅ | ✅ |
| الفعاليات | ✅ | ✅ | ✅ |
| التسجيل في فعالية | ✅ | ✅ | ✅ |
| لوحة العضو | ❌ | ✅ | ✅ |
| تسجيل الحضور | ❌ | ✅ | ✅ |
| لوحة الإدارة | ❌ | ❌ | ✅ |
| إدارة الفعاليات | ❌ | ❌ | ✅ |
| إدارة الأعضاء | ❌ | ❌ | ✅ |

---

## التقنيات المستخدمة

- **Next.js 14** — App Router, Server Components, Server Actions
- **TypeScript** — Type safety
- **Tailwind CSS** — Styling
- **Supabase** — Auth, PostgreSQL, Storage, Edge Functions
- **Vercel** — Hosting

---

*FabLab Club — WE PLAN. WE CREATE*
