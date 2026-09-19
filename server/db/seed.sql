-- Sample data for development.
--
-- This starts with TRUNCATE. That is correct on your laptop and catastrophic
-- against the database your live demo depends on. Check which DATABASE_URL is
-- loaded before you run it.

TRUNCATE TABLE sightings RESTART IDENTITY CASCADE;

INSERT INTO sightings (place, description, spookiness, reported_at) VALUES
  ('Library, third floor',
   'Chairs rearranged overnight, every time. The night guard says he locks the room himself.',
   3, now() - interval '12 days'),
  ('Old gym',
   'Lights flicker in a fixed pattern after 9pm, always three short and one long.',
   4, now() - interval '10 days'),
  ('Parking basement',
   'Footsteps with no one there. Reported separately by three different people in one week, which is what makes this one hard to dismiss. Two of them were alone at the time and did not know about the others. This row is deliberately long, because a seed of four words hides every text-wrapping bug you have.',
   5, now() - interval '8 days'),
  ('Canteen',
   'A cold spot near the back door, every morning before seven.',
   1, now() - interval '7 days'),
  ('AB Building stairwell',
   '',
   2, now() - interval '5 days'),
  ('Chapel garden',
   'Someone humming. Stops the moment you turn around.',
   3, now() - interval '2 days');
