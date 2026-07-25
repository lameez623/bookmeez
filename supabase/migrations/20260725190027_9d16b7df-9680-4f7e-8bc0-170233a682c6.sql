DROP FUNCTION IF EXISTS public.get_booked_slots();

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon, authenticated, public;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO service_role;

REVOKE EXECUTE ON FUNCTION public.get_availability() FROM public;
GRANT EXECUTE ON FUNCTION public.get_availability() TO anon, authenticated, service_role;