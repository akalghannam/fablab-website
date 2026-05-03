// Supabase Edge Function: cleanup-storage
// Scheduled to run on 1st of every month via pg_cron or Supabase Schedules
// Deletes lab-status photos older than 30 days from storage and nulls DB records

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const BUCKET = 'lab-status-photos'
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000

Deno.serve(async (req) => {
  // Verify this is an authorized cron call
  const authHeader = req.headers.get('Authorization')
  if (authHeader !== `Bearer ${Deno.env.get('CRON_SECRET')}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const cutoff = new Date(Date.now() - THIRTY_DAYS_MS).toISOString()

  // Fetch old reports with photos
  const { data: oldReports, error: fetchError } = await supabase
    .from('lab_status_reports')
    .select('id, photos, created_at')
    .lt('created_at', cutoff)
    .not('photos', 'is', null)

  if (fetchError) {
    console.error('Fetch error:', fetchError)
    return new Response(JSON.stringify({ error: fetchError.message }), { status: 500 })
  }

  let filesDeleted = 0
  let spaceFreedbytes = 0

  for (const report of oldReports ?? []) {
    if (!report.photos?.length) continue

    const paths = report.photos.map((url: string) => {
      const parts = url.split(`${BUCKET}/`)
      return parts[1] ?? url
    })

    // Get file sizes before deletion for space calculation
    for (const path of paths) {
      try {
        const { data } = await supabase.storage.from(BUCKET).list(path.split('/').slice(0, -1).join('/'))
        const file = data?.find(f => f.name === path.split('/').pop())
        if (file?.metadata?.size) spaceFreedbytes += file.metadata.size
      } catch { /* skip size calc if not available */ }
    }

    const { error: deleteError } = await supabase.storage.from(BUCKET).remove(paths)
    if (!deleteError) {
      filesDeleted += paths.length

      // Null out photos in DB
      await supabase
        .from('lab_status_reports')
        .update({ photos: null })
        .eq('id', report.id)
    }
  }

  const spaceMB = spaceFreedbytes / (1024 * 1024)

  // Log the cleanup operation
  await supabase.from('storage_cleanup_logs').insert({
    files_deleted: filesDeleted,
    space_freed_mb: parseFloat(spaceMB.toFixed(2)),
  })

  const result = {
    success: true,
    files_deleted: filesDeleted,
    space_freed_mb: spaceMB.toFixed(2),
    reports_processed: oldReports?.length ?? 0,
    cutoff_date: cutoff,
  }

  console.log('Cleanup complete:', result)
  return new Response(JSON.stringify(result), {
    headers: { 'Content-Type': 'application/json' },
  })
})
