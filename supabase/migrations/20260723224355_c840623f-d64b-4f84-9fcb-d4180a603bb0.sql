
CREATE TABLE public.bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  parent_name TEXT NOT NULL,
  learner_name TEXT NOT NULL,
  grade TEXT NOT NULL,
  school TEXT,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  subjects TEXT[] NOT NULL,
  lesson_type TEXT NOT NULL CHECK (lesson_type IN ('individual','group')),
  session_mode TEXT NOT NULL CHECK (session_mode IN ('online','in_person')),
  day_of_week TEXT NOT NULL,
  time_slot TEXT NOT NULL,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'confirmed',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX bookings_unique_slot ON public.bookings (day_of_week, time_slot) WHERE status = 'confirmed';

GRANT SELECT, INSERT ON public.bookings TO anon;
GRANT SELECT, INSERT ON public.bookings TO authenticated;
GRANT ALL ON public.bookings TO service_role;

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Anyone can create a booking (public form)
CREATE POLICY "Anyone can create bookings" ON public.bookings FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Public can read only booked slots (day + time) — safe minimal exposure via a view? Simpler: allow reading day/time only through a security-definer function.
-- For simplicity we allow reading a redacted set through an RPC below; deny direct SELECT.
CREATE POLICY "No direct read" ON public.bookings FOR SELECT TO anon, authenticated USING (false);

-- Function returning only booked (day, time) pairs for the current confirmed bookings
CREATE OR REPLACE FUNCTION public.get_booked_slots()
RETURNS TABLE (day_of_week TEXT, time_slot TEXT)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT day_of_week, time_slot FROM public.bookings WHERE status = 'confirmed';
$$;

GRANT EXECUTE ON FUNCTION public.get_booked_slots() TO anon, authenticated;
