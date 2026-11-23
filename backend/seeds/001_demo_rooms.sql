-- Fictional rooms for a practice database.
INSERT INTO public.rooms (id, nightly_price)
VALUES
    (1, 750),
    (2, NULL)
ON CONFLICT (id) DO NOTHING;
