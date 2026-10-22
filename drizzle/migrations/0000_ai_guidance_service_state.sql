CREATE TABLE public.ai_service_state (id text PRIMARY KEY, status integer NOT NULL, message text NOT NULL, updated_at timestamptz NOT NULL DEFAULT now());
GRANT ALL ON public.ai_service_state TO service_role;
ALTER TABLE public.ai_service_state ENABLE ROW LEVEL SECURITY;
COMMENT ON TABLE public.ai_service_state IS 'Service-only AI access circuit breaker. Contains no mood, note, identity, or other user data.';