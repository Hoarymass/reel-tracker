-- Run this in your Supabase SQL Editor to set up the database

CREATE TABLE IF NOT EXISTS movies (
  id          SERIAL PRIMARY KEY,
  title       TEXT NOT NULL,
  year        INTEGER,
  platform    TEXT,
  language    TEXT DEFAULT 'English',
  genre       TEXT,
  rt_critics  INTEGER,
  rt_audience INTEGER,
  runtime     TEXT,
  status      TEXT DEFAULT 'watchlist' CHECK (status IN ('watchlist','watched','skipped')),
  rating      INTEGER CHECK (rating BETWEEN 1 AND 5),
  notes       TEXT DEFAULT '',
  synopsis    TEXT DEFAULT '',
  sort_order  INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-update updated_at on row changes
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON movies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Seed data: all 31 movies
INSERT INTO movies (id, title, year, platform, language, genre, rt_critics, rt_audience, runtime, status, rating, notes, synopsis) VALUES
(1,'Wake Up Dead Man',2025,'Netflix','English','Mystery / Thriller',92,94,'2h 24m','watched',5,'Loved it','Detective Benoit Blanc investigates a mysterious murder inside a church in upstate New York. The darkest Knives Out entry, anchored by a scene-stealing Josh O''Connor performance.'),
(2,'Hit Man',2024,'Netflix','English','Crime / Thriller',95,89,'1h 53m','watchlist',NULL,'','A mild-mannered professor moonlighting as a fake hitman falls for a woman who hired him to kill her husband. Inspired by a true story. Directed by Richard Linklater.'),
(3,'Caught Stealing',2025,'Netflix','English','Action / Thriller',85,83,'~1h 50m','watchlist',NULL,'','A New York bartender agrees to watch his neighbor''s cat and finds himself hunted by multiple criminal factions. Directed by Darren Aronofsky.'),
(4,'Glass Onion',2022,'Netflix','English','Mystery / Comedy',92,79,'2h 19m','watched',NULL,'','Detective Benoit Blanc is invited to a tech billionaire''s private Greek island for a murder mystery party — when someone actually ends up dead, everyone is a suspect.'),
(5,'Society of the Snow',2024,'Netflix','Spanish','Survival / Thriller',90,86,'2h 24m','watchlist',NULL,'','The true story of the 1972 Andes plane crash. Survivors stranded 72 days face impossible choices. Directed by J.A. Bayona.'),
(6,'Decision to Leave',2022,'MUBI (rent)','Korean','Mystery / Romance',94,NULL,'2h 18m','watchlist',NULL,'','A detective investigating a suspicious death becomes obsessed with the enigmatic widow. Neo-noir from Park Chan-wook — Best Director at Cannes 2022.'),
(7,'Anora',2024,'Hulu','English','Drama / Dark Comedy',93,84,'2h 19m','watched',NULL,'','A Brooklyn sex worker impulsively marries the son of a Russian oligarch — until his furious parents arrive to annul it. Mikey Madison won Best Actress. Palme d''Or and 5 Oscars.'),
(8,'The Brutalist',2024,'Max','English','Historical Drama / Epic',93,NULL,'3h 35m','watchlist',NULL,'Built-in intermission — best as two-sitting watch.','A Hungarian-Jewish architect survives the Holocaust and immigrates to postwar America. Adrien Brody won Best Actor. Directed by Brady Corbet.'),
(9,'Okja',2017,'Netflix','English / Korean','Adventure / Dark Satire',81,NULL,'1h 58m','watchlist',NULL,'Bong Joon-ho.','A girl races to rescue her giant super-pig from a multinational corporation. Bong Joon-ho''s dark satire. Tilda Swinton and Jake Gyllenhaal.'),
(10,'Parasite',2019,'Netflix','Korean','Thriller / Dark Comedy',99,90,'2h 12m','watched',4,'Bong Joon-ho','A poor Korean family schemes into the employ of a wealthy household. Bong Joon-ho''s Oscar-winning masterpiece. First non-English film to win Best Picture.'),
(11,'Memories of Murder',2003,'Netflix','Korean','Crime Thriller',95,NULL,'2h 11m','watched',4,'Bong Joon-ho','Two detectives investigate South Korea''s first known serial murders in the 1980s. Bong Joon-ho''s breakthrough — tense, darkly funny, devastating.'),
(12,'The Host',2006,'Netflix','Korean','Monster / Thriller',93,NULL,'1h 59m','watched',4,'Bong Joon-ho','A mutant creature emerges from Seoul''s Han River and snatches a young girl. Bong Joon-ho''s genre-bending monster movie.'),
(13,'Snowpiercer',2013,'Rent/Other','English','Sci-Fi / Action',94,NULL,'2h 6m','watched',4,'Bong Joon-ho','After climate catastrophe, survivors live on a train divided by class. A lower-class revolt led by Chris Evans fights toward the engine.'),
(14,'Mother',2009,'Rent/Other','Korean','Thriller / Drama',95,NULL,'2h 8m','watched',4,'Bong Joon-ho','A devoted mother sets out to prove her son innocent after he''s accused of murder. Bong Joon-ho''s most emotionally devastating film.'),
(15,'Concrete Utopia',2023,'Rent/Other (Rakuten Viki)','Korean','Disaster / Thriller',100,77,'2h 10m','watchlist',NULL,'Parasite-like social satire.','A massive earthquake destroys Seoul leaving only one apartment building. Residents vote to expel outsiders — a terrifying new social order emerges.'),
(16,'RRR',2022,'Netflix','Telugu','Action / Epic',90,94,'3h 7m','watchlist',NULL,'Won Oscar for Naatu Naatu.','Two Indian revolutionaries forge an unlikely friendship before fighting for independence against British colonial rule in the 1920s.'),
(17,'Marty Supreme',2025,'Max','English','Sports Drama / Thriller',93,82,'~2h','watchlist',NULL,'','Timothée Chalamet plays an obsessive table tennis competitor. Directed by Josh Safdie (Uncut Gems). Highest-grossing A24 film of all time.'),
(18,'The Mastermind',2025,'Rent/Other (MUBI)','English','Heist / Crime Drama',90,NULL,'~1h 45m','watchlist',NULL,'Stars Josh O''Connor. Slow-burn Kelly Reichardt.','In 1970 Massachusetts, an unemployed carpenter schemes to steal paintings from a local art museum.'),
(19,'Hard Truths',2024,'Netflix','English','Drama',95,NULL,'1h 37m','watchlist',NULL,'Pure character drama — not a thriller.','In London, a depressed and furiously unhappy woman lashes out at everyone before Mother''s Day. Marianne Jean-Baptiste. Directed by Mike Leigh.'),
(20,'The Return',2024,'Rent/Other','English','Historical Drama',78,NULL,'1h 56m','watchlist',NULL,'Slow burn.','After 20 years, Odysseus washes up on Ithaca — haggard and unrecognizable. Ralph Fiennes and Juliette Binoche.'),
(21,'The Spirit of the Beehive',1973,'Rent/Other','Spanish','Drama / Fantasy',96,NULL,'1h 38m','watchlist',NULL,'One of the 100 greatest films ever (Sight & Sound).','In 1940 Castile, six-year-old Ana watches Frankenstein and becomes obsessed with finding the monster. Directed by Víctor Erice.'),
(22,'Close Your Eyes',2023,'Rent/Other','Spanish','Mystery / Drama',93,NULL,'~2h 52m','watchlist',NULL,'Watch Spirit of the Beehive first.','A filmmaker recounts the mysterious disappearance of his lead actor decades ago. Víctor Erice''s first feature in 30 years.'),
(23,'Queer',2024,'Max','English','Period Drama / Romance',77,65,'2h 17m','watchlist',NULL,'Score by Trent Reznor & Atticus Ross.','In 1950s Mexico City, a solitary American expat''s obsessive love leads him and a young soldier into the jungle. Daniel Craig. Directed by Luca Guadagnino.'),
(24,'Tinker Tailor Soldier Spy',2011,'Netflix','English','Spy Thriller',83,NULL,'2h 7m','watchlist',NULL,'Dense — rewards full attention.','Retired spy George Smiley uncovers a Soviet mole at the top of British intelligence. Gary Oldman, Colin Firth, Tom Hardy, Benedict Cumberbatch.'),
(25,'Disclaimer',2024,'Apple TV+','English','Psychological Thriller',76,NULL,'7 episodes (~1hr each)','watchlist',NULL,'Miniseries. Cuarón shot it like a film.','A journalist receives a novel and realizes she is the main character — its story threatens to expose a buried secret. Cate Blanchett. Alfonso Cuarón directs.'),
(26,'Nobody Wants This',2024,'Netflix','English','Romantic Comedy',95,85,'10 eps (~30 min)','watchlist',NULL,'Season 2 also out.','An agnostic sex podcaster and a newly single rabbi fall in love. Kristen Bell and Adam Brody. Created by Erin Foster.'),
(27,'A Private Life',2025,'Rent/Other','French','Mystery / Thriller',80,66,'~2h','watchlist',NULL,'Check streaming — recently released.','A Paris psychiatrist believes a patient was murdered and launches a private investigation. Jodie Foster. Directed by Rebecca Zlotowski.'),
(28,'The Ministry of Ungentlemanly Warfare',2024,'Rent/Other (Starz)','English','Action / War',68,93,'2h','watchlist',NULL,'Critics split, audiences love it.','Churchill''s first special forces unit strikes the Nazis using ungentlemanly tactics. Based on declassified files. Henry Cavill. Guy Ritchie.'),
(29,'In the Grey',2026,'In theaters May 15, 2026','English','Action / Thriller',NULL,NULL,'TBD','watchlist',NULL,'In theaters May 15, 2026.','A cocky American (Gyllenhaal) and a no-nonsense Brit (Cavill) steal back a billion-dollar fortune from a ruthless despot. Directed by Guy Ritchie.'),
(30,'Guy Ritchie''s The Covenant',2023,'Max','English','War / Thriller',90,95,'2h 3m','watchlist',NULL,'Ritchie''s best-reviewed film in years.','US Army Sergeant Kinley (Gyllenhaal) is ambushed in Afghanistan. His interpreter Ahmed risks everything to bring him home. Based on true events.'),
(31,'How to Succeed in Business Without Really Trying',1967,'Rent/Other (Tubi free)','English','Musical Comedy',NULL,NULL,'2h 1m','watchlist',NULL,'Pulitzer Prize-winning musical. Free on Tubi.','Window washer J. Pierpont Finch schemes from the mailroom to the executive suite. A sharp satire of corporate sycophancy. Bob Fosse choreography.');

-- Reset sequence to start after seed data
SELECT setval('movies_id_seq', (SELECT MAX(id) FROM movies));
