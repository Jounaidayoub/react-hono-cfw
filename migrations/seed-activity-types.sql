INSERT INTO activity_types (
  id,
  code,
  name,
  description,
  xp_value,
  is_active,
  created_at,
  updated_at
) VALUES (
  'act_meetup_attendance',
  'MEETUP_ATTENDANCE',
  'Meetup Attendance',
  'Awarded for attending an in-person meetup or event',
  100,
  1,
  (cast(unixepoch() * 1000 as integer)),
  (cast(unixepoch() * 1000 as integer))
)
ON CONFLICT(code) DO NOTHING;
