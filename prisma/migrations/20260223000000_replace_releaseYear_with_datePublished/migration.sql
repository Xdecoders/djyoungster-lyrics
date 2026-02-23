-- AlterTable: Add datePublished and dateModified columns
ALTER TABLE `Song` ADD COLUMN `datePublished` DATETIME(3) NULL;
ALTER TABLE `Song` ADD COLUMN `dateModified` DATETIME(3) NULL;

-- Data migration: Convert existing releaseYear (int) to datePublished (DateTime)
UPDATE `Song` SET `datePublished` = STR_TO_DATE(CONCAT(`releaseYear`, '-01-01'), '%Y-%m-%d') WHERE `releaseYear` IS NOT NULL;

-- Set dateModified to updatedAt for existing records
UPDATE `Song` SET `dateModified` = `updatedAt` WHERE `updatedAt` IS NOT NULL;

-- Drop the old releaseYear column
ALTER TABLE `Song` DROP COLUMN `releaseYear`;

-- Add index on datePublished
CREATE INDEX `Song_datePublished_idx` ON `Song`(`datePublished`);
