-- ============================================================
-- Fix brand name casing: Djyoungster / DjYoungster → DJYoungster
-- Run on production MySQL database
-- Safe to run multiple times (idempotent)
-- ============================================================

-- Song
UPDATE Song SET
  metaTitle       = REPLACE(REPLACE(metaTitle,       'DjYoungster', 'DJYoungster'), 'Djyoungster', 'DJYoungster'),
  metaDescription = REPLACE(REPLACE(metaDescription, 'DjYoungster', 'DJYoungster'), 'Djyoungster', 'DJYoungster'),
  meaning         = REPLACE(REPLACE(meaning,         'DjYoungster', 'DJYoungster'), 'Djyoungster', 'DJYoungster')
WHERE metaTitle       LIKE '%youngster%'
   OR metaDescription LIKE '%youngster%'
   OR meaning         LIKE '%youngster%';

-- Artist
UPDATE Artist SET
  metaTitle       = REPLACE(REPLACE(metaTitle,       'DjYoungster', 'DJYoungster'), 'Djyoungster', 'DJYoungster'),
  metaDescription = REPLACE(REPLACE(metaDescription, 'DjYoungster', 'DJYoungster'), 'Djyoungster', 'DJYoungster'),
  bio             = REPLACE(REPLACE(bio,             'DjYoungster', 'DJYoungster'), 'Djyoungster', 'DJYoungster')
WHERE metaTitle       LIKE '%youngster%'
   OR metaDescription LIKE '%youngster%'
   OR bio             LIKE '%youngster%';

-- Album
UPDATE Album SET
  metaTitle       = REPLACE(REPLACE(metaTitle,       'DjYoungster', 'DJYoungster'), 'Djyoungster', 'DJYoungster'),
  metaDescription = REPLACE(REPLACE(metaDescription, 'DjYoungster', 'DJYoungster'), 'Djyoungster', 'DJYoungster')
WHERE metaTitle       LIKE '%youngster%'
   OR metaDescription LIKE '%youngster%';

-- Genre
UPDATE Genre SET
  metaTitle       = REPLACE(REPLACE(metaTitle,       'DjYoungster', 'DJYoungster'), 'Djyoungster', 'DJYoungster'),
  metaDescription = REPLACE(REPLACE(metaDescription, 'DjYoungster', 'DJYoungster'), 'Djyoungster', 'DJYoungster'),
  description     = REPLACE(REPLACE(description,     'DjYoungster', 'DJYoungster'), 'Djyoungster', 'DJYoungster')
WHERE metaTitle       LIKE '%youngster%'
   OR metaDescription LIKE '%youngster%'
   OR description     LIKE '%youngster%';

-- Category
UPDATE Category SET
  metaTitle       = REPLACE(REPLACE(metaTitle,       'DjYoungster', 'DJYoungster'), 'Djyoungster', 'DJYoungster'),
  metaDescription = REPLACE(REPLACE(metaDescription, 'DjYoungster', 'DJYoungster'), 'Djyoungster', 'DJYoungster'),
  description     = REPLACE(REPLACE(description,     'DjYoungster', 'DJYoungster'), 'Djyoungster', 'DJYoungster')
WHERE metaTitle       LIKE '%youngster%'
   OR metaDescription LIKE '%youngster%'
   OR description     LIKE '%youngster%';

-- Tag
UPDATE Tag SET
  metaTitle       = REPLACE(REPLACE(metaTitle,       'DjYoungster', 'DJYoungster'), 'Djyoungster', 'DJYoungster'),
  metaDescription = REPLACE(REPLACE(metaDescription, 'DjYoungster', 'DJYoungster'), 'Djyoungster', 'DJYoungster'),
  description     = REPLACE(REPLACE(description,     'DjYoungster', 'DJYoungster'), 'Djyoungster', 'DJYoungster')
WHERE metaTitle       LIKE '%youngster%'
   OR metaDescription LIKE '%youngster%'
   OR description     LIKE '%youngster%';

-- Movie
UPDATE Movie SET
  metaTitle       = REPLACE(REPLACE(metaTitle,       'DjYoungster', 'DJYoungster'), 'Djyoungster', 'DJYoungster'),
  metaDescription = REPLACE(REPLACE(metaDescription, 'DjYoungster', 'DJYoungster'), 'Djyoungster', 'DJYoungster'),
  description     = REPLACE(REPLACE(description,     'DjYoungster', 'DJYoungster'), 'Djyoungster', 'DJYoungster')
WHERE metaTitle       LIKE '%youngster%'
   OR metaDescription LIKE '%youngster%'
   OR description     LIKE '%youngster%';

-- TopList
UPDATE TopList SET
  metaTitle       = REPLACE(REPLACE(metaTitle,       'DjYoungster', 'DJYoungster'), 'Djyoungster', 'DJYoungster'),
  metaDescription = REPLACE(REPLACE(metaDescription, 'DjYoungster', 'DJYoungster'), 'Djyoungster', 'DJYoungster'),
  description     = REPLACE(REPLACE(description,     'DjYoungster', 'DJYoungster'), 'Djyoungster', 'DJYoungster')
WHERE metaTitle       LIKE '%youngster%'
   OR metaDescription LIKE '%youngster%'
   OR description     LIKE '%youngster%';

-- SiteSeoSettings
UPDATE SiteSeoSettings SET
  metaTitle       = REPLACE(REPLACE(metaTitle,       'DjYoungster', 'DJYoungster'), 'Djyoungster', 'DJYoungster'),
  metaDescription = REPLACE(REPLACE(metaDescription, 'DjYoungster', 'DJYoungster'), 'Djyoungster', 'DJYoungster'),
  ogTitle         = REPLACE(REPLACE(ogTitle,         'DjYoungster', 'DJYoungster'), 'Djyoungster', 'DJYoungster'),
  ogDescription   = REPLACE(REPLACE(ogDescription,   'DjYoungster', 'DJYoungster'), 'Djyoungster', 'DJYoungster')
WHERE metaTitle       LIKE '%youngster%'
   OR metaDescription LIKE '%youngster%'
   OR ogTitle         LIKE '%youngster%'
   OR ogDescription   LIKE '%youngster%';

-- Page (about-us, privacy-policy, etc.)
UPDATE Page SET
  title           = REPLACE(REPLACE(title,           'DjYoungster', 'DJYoungster'), 'Djyoungster', 'DJYoungster'),
  metaTitle       = REPLACE(REPLACE(metaTitle,       'DjYoungster', 'DJYoungster'), 'Djyoungster', 'DJYoungster'),
  metaDescription = REPLACE(REPLACE(metaDescription, 'DjYoungster', 'DJYoungster'), 'Djyoungster', 'DJYoungster'),
  content         = REPLACE(REPLACE(content,         'DjYoungster', 'DJYoungster'), 'Djyoungster', 'DJYoungster')
WHERE title           LIKE '%youngster%'
   OR metaTitle       LIKE '%youngster%'
   OR metaDescription LIKE '%youngster%'
   OR content         LIKE '%youngster%';

-- ============================================================
-- Done. Verify with:
-- SELECT COUNT(*) FROM Song WHERE metaTitle LIKE '%Djyoungster%' OR metaTitle LIKE '%DjYoungster%';
-- ============================================================
