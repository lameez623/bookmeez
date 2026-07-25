-- 1. Roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "Users can read their own roles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- 2. Bookings: move to real dates
ALTER TABLE public.bookings ADD COLUMN lesson_date date;

UPDATE public.bookings SET lesson_date = CURRENT_DATE WHERE lesson_date IS NULL;
ALTER TABLE public.bookings ALTER COLUMN lesson_date SET NOT NULL;

DROP INDEX IF EXISTS public.bookings_unique_slot;
CREATE UNIQUE INDEX bookings_unique_date_slot
  ON public.bookings (lesson_date, time_slot)
  WHERE status = 'confirmed';

CREATE POLICY "Admins can view bookings"
  ON public.bookings FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update bookings"
  ON public.bookings FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete bookings"
  ON public.bookings FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 3. Blocked dates / slots (time_slot NULL = whole day blocked)
CREATE TABLE public.blocked_slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  blocked_date date NOT NULL,
  time_slot text,
  reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX blocked_slots_unique_day ON public.blocked_slots (blocked_date) WHERE time_slot IS NULL;
CREATE UNIQUE INDEX blocked_slots_unique_slot ON public.blocked_slots (blocked_date, time_slot) WHERE time_slot IS NOT NULL;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.blocked_slots TO authenticated;
GRANT ALL ON public.blocked_slots TO service_role;
ALTER TABLE public.blocked_slots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage blocked slots"
  ON public.blocked_slots FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 4. Public availability function (no PII)
CREATE OR REPLACE FUNCTION public.get_booked_slots()
RETURNS TABLE(day_of_week text, time_slot text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT day_of_week, time_slot FROM public.bookings WHERE status = 'confirmed';
$$;

CREATE OR REPLACE FUNCTION public.get_availability()
RETURNS TABLE(lesson_date date, time_slot text, kind text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT b.lesson_date, b.time_slot, 'booked'::text
  FROM public.bookings b
  WHERE b.status = 'confirmed' AND b.lesson_date >= CURRENT_DATE
  UNION ALL
  SELECT s.blocked_date, s.time_slot, 'blocked'::text
  FROM public.blocked_slots s
  WHERE s.blocked_date >= CURRENT_DATE;
$$;

GRANT EXECUTE ON FUNCTION public.get_availability() TO anon, authenticated, service_role;