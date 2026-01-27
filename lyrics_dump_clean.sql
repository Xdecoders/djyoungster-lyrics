-- MySQL dump 10.13  Distrib 9.6.0, for Win64 (x86_64)
--
-- Host: localhost    Database: lyrics_db
-- ------------------------------------------------------
-- Server version	9.6.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `_prisma_migrations`
--

DROP TABLE IF EXISTS `_prisma_migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `_prisma_migrations` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `checksum` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `finished_at` datetime(3) DEFAULT NULL,
  `migration_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `logs` text COLLATE utf8mb4_unicode_ci,
  `rolled_back_at` datetime(3) DEFAULT NULL,
  `started_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `applied_steps_count` int unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `_prisma_migrations`
--

LOCK TABLES `_prisma_migrations` WRITE;
/*!40000 ALTER TABLE `_prisma_migrations` DISABLE KEYS */;
INSERT INTO `_prisma_migrations` VALUES ('bc39e625-9472-4e36-ac1b-960b64bc080a','f3844b17f0f73281d427a3140dec61a32bf35220f350bc5f244b09897417dc09','2026-01-22 05:53:15.161','20260122055314_init',NULL,NULL,'2026-01-22 05:53:14.622',1);
/*!40000 ALTER TABLE `_prisma_migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `admin`
--

DROP TABLE IF EXISTS `admin`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `admin` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'admin',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Admin_email_key` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admin`
--

LOCK TABLES `admin` WRITE;
/*!40000 ALTER TABLE `admin` DISABLE KEYS */;
INSERT INTO `admin` VALUES ('0b8048b3-f763-11f0-8bf8-b42e99a69480','admin@lyrics.com','$2b$12$K7arhWm/PiY9qqA1/Lq5A.WfkMWw7JVZ.E.8aLF.9oN1ZbYfI7Xta','Admin','admin','2026-01-22 12:52:01.000','2026-01-22 12:52:01.000');
/*!40000 ALTER TABLE `admin` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `album`
--

DROP TABLE IF EXISTS `album`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `album` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `coverImage` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `releaseDate` datetime(3) DEFAULT NULL,
  `label` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `metaTitle` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `metaDescription` text COLLATE utf8mb4_unicode_ci,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  `artistId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Album_slug_key` (`slug`),
  KEY `Album_slug_idx` (`slug`),
  KEY `Album_artistId_fkey` (`artistId`),
  CONSTRAINT `Album_artistId_fkey` FOREIGN KEY (`artistId`) REFERENCES `artist` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `album`
--

LOCK TABLES `album` WRITE;
/*!40000 ALTER TABLE `album` DISABLE KEYS */;
/*!40000 ALTER TABLE `album` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `artist`
--

DROP TABLE IF EXISTS `artist`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `artist` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `bio` text COLLATE utf8mb4_unicode_ci,
  `imageUrl` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `country` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `socialLinks` text COLLATE utf8mb4_unicode_ci,
  `metaTitle` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `metaDescription` text COLLATE utf8mb4_unicode_ci,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Artist_slug_key` (`slug`),
  KEY `Artist_slug_idx` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `artist`
--

LOCK TABLES `artist` WRITE;
/*!40000 ALTER TABLE `artist` DISABLE KEYS */;
INSERT INTO `artist` VALUES ('00ceab27-2ee5-4720-beec-9db4685ea7e1','Arijit Singh','arijit-singh','Arijit Singh is an Indian playback singer and music composer. He is the recipient of a National Award and six Filmfare Awards.','https://i.scdn.co/image/ab6761610000e5eb0261696c5df3be99da6ed3f3','India',NULL,NULL,NULL,'2026-01-23 15:55:30.184','2026-01-23 15:55:30.184'),('20ce577e-0830-4a9d-b8ad-fe5cc3eb749a','Shreya Ghoshal','shreya-ghoshal','Shreya Ghoshal is an Indian playback singer. She has received four National Film Awards and numerous Filmfare Awards.',NULL,'India',NULL,NULL,NULL,'2026-01-23 15:55:30.184','2026-01-26 11:22:21.919'),('b32910e1-61ea-418b-b116-1eaa90ecfef5','Sunanda Sharma','sunanda-sharma',NULL,NULL,'India',NULL,'Sunanda Sharma',NULL,'2026-01-26 13:35:21.051','2026-01-26 13:35:21.051'),('d2cda217-1944-4b3a-b49a-6312e0f5562c','Sukhwinder Singh','sukhwinder-singh','Sukhwinder Singh (born 18 July 1971) is an Indian playback singer who primarily sings Bollywood songs. He sang \"Jai Ho\" in the film Slumdog Millionaire, for which he won a Grammy Award for Best Song Written for a Motion Picture, Television or Other Visual Media. He has also received two Filmfare awards for his singing.','https://c.saavncdn.com/artists/Sukhwinder_Singh_003_20240715112657_500x500.jpg','India',NULL,'Sukhwinder Singh All Songs Lyrics','Sukhwinder Singh All Songs Lyrics','2026-01-22 08:49:09.742','2026-01-22 08:49:09.742');
/*!40000 ALTER TABLE `artist` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `category`
--

DROP TABLE IF EXISTS `category`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `category` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `metaDescription` text COLLATE utf8mb4_unicode_ci,
  `metaTitle` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Category_name_key` (`name`),
  UNIQUE KEY `Category_slug_key` (`slug`),
  KEY `Category_slug_idx` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `category`
--

LOCK TABLES `category` WRITE;
/*!40000 ALTER TABLE `category` DISABLE KEYS */;
INSERT INTO `category` VALUES ('55161057-89a2-4680-9bd0-c42de2b92ce8','Punjabi','punjabi','2026-01-22 09:04:20.629',NULL,NULL),('8d5a5183-ffb6-45d5-a921-20f68108955a','Tamil','tamil','2026-01-22 09:04:35.379',NULL,NULL),('8fe2e2c4-d063-4a33-8ca6-0c003e5b9f2b','English','english','2026-01-22 09:04:30.971',NULL,NULL),('b354a618-f8e1-4407-935d-e42279c0abb4','Telgu','telgu','2026-01-22 09:04:41.003',NULL,NULL),('d8b52881-8532-44d6-afa8-e86ae937fb82','Hindi','hindi','2026-01-22 09:04:26.139',NULL,NULL);
/*!40000 ALTER TABLE `category` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `genre`
--

DROP TABLE IF EXISTS `genre`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `genre` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `imageUrl` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `metaDescription` text COLLATE utf8mb4_unicode_ci,
  `metaTitle` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Genre_name_key` (`name`),
  UNIQUE KEY `Genre_slug_key` (`slug`),
  KEY `Genre_slug_idx` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `genre`
--

LOCK TABLES `genre` WRITE;
/*!40000 ALTER TABLE `genre` DISABLE KEYS */;
INSERT INTO `genre` VALUES ('0d1580fa-3a01-4852-9094-3d1ec18ed130','Jazz','jazz',NULL,NULL,'2026-01-22 09:02:42.923',NULL,NULL),('11170f29-8083-4c37-90e0-cf50acdc66a3','Party','party','Party and dance songs',NULL,'2026-01-23 15:55:30.176',NULL,NULL),('1cef0d6d-db5d-4509-9621-ded008551143','Classical','classical',NULL,NULL,'2026-01-22 09:01:36.909',NULL,NULL),('35a89bad-d201-420c-b041-7bec9ba80602','Other','other',NULL,NULL,'2026-01-22 09:03:54.012',NULL,NULL),('3e0e3797-c94e-48b3-9159-4ba6f1bcaac1','Blues','blues',NULL,NULL,'2026-01-22 09:01:50.516',NULL,NULL),('5b2b7997-b8c2-4249-bbbe-7f8892c33e86','Pop','pop',NULL,NULL,'2026-01-22 09:02:50.972',NULL,NULL),('74705e53-a306-433b-a1a9-23e005343255','Rock','rock',NULL,NULL,'2026-01-22 09:03:21.316',NULL,NULL),('74ac0814-9f45-44ef-ab47-05f6bc7c7ea7','Folk','folk',NULL,NULL,'2026-01-22 09:02:25.852',NULL,NULL),('764b0abe-2c30-4997-b29c-d5c65bffce61','Electronic','electronic',NULL,NULL,'2026-01-22 09:02:10.317',NULL,NULL),('8988177d-d36e-47d5-9be2-c56a88301a19','Romantic','romantic','Love and romantic songs',NULL,'2026-01-23 15:55:30.176',NULL,NULL),('a0fb7995-b2d2-4a37-b5a4-0b31c8b341f0','Hip-hop','hip-hop',NULL,NULL,'2026-01-22 09:02:35.363',NULL,NULL),('ae02d0ae-8bb1-4c8f-a28f-485a07396919','Religious','religious',NULL,NULL,'2026-01-22 09:03:45.572',NULL,NULL),('c94f389c-5f35-48b2-8ac9-1bd086d357ac','Sad','sad','Emotional and sad songs',NULL,'2026-01-23 15:55:30.176',NULL,NULL),('e33b3787-6bc7-471a-8e77-359170c4dcb1','Country','country',NULL,NULL,'2026-01-22 09:01:56.780',NULL,NULL);
/*!40000 ALTER TABLE `genre` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `movie`
--

DROP TABLE IF EXISTS `movie`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `movie` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `year` int DEFAULT NULL,
  `director` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `posterUrl` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `slug` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cast` text COLLATE utf8mb4_unicode_ci,
  `description` text COLLATE utf8mb4_unicode_ci,
  `genre` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `language` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `metaDescription` text COLLATE utf8mb4_unicode_ci,
  `metaTitle` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `musicDirector` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `producer` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `writer` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Movie_slug_key` (`slug`),
  KEY `Movie_slug_idx` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `movie`
--

LOCK TABLES `movie` WRITE;
/*!40000 ALTER TABLE `movie` DISABLE KEYS */;
INSERT INTO `movie` VALUES ('2c173b8c-bd98-4c54-85c6-900b0bf487c4','Battle Of Galwan',2026,NULL,'2026-01-26 03:53:50.860',NULL,'battle-of-galwan',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `movie` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `newsletter`
--

DROP TABLE IF EXISTS `newsletter`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `newsletter` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `subject` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `content` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'draft',
  `sentAt` datetime(3) DEFAULT NULL,
  `sentTo` int NOT NULL DEFAULT '0',
  `openCount` int NOT NULL DEFAULT '0',
  `clickCount` int NOT NULL DEFAULT '0',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `newsletter`
--

LOCK TABLES `newsletter` WRITE;
/*!40000 ALTER TABLE `newsletter` DISABLE KEYS */;
INSERT INTO `newsletter` VALUES ('a6a3ea14-cfa6-4bd8-8433-1d8b8db21883','🎵 New Lyrics: Maatrubhumi by Arijit Singh','<!DOCTYPE html>\n<html>\n<head>\n  <meta charset=\"utf-8\">\n  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n  <title>Maatrubhumi - New Lyrics on DJYoungster</title>\n</head>\n<body style=\"margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, sans-serif;\">\n  <table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" style=\"background-color: #f8fafc; padding: 40px 20px;\">\n    <tr>\n      <td align=\"center\">\n        <table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" style=\"max-width: 500px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);\">\n\n          <!-- Header -->\n          <tr>\n            <td style=\"background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 24px; text-align: center;\">\n              <h1 style=\"margin: 0; color: #ffffff; font-size: 24px; font-weight: 700;\">DJYoungster</h1>\n              <p style=\"margin: 8px 0 0; color: rgba(255,255,255,0.9); font-size: 14px;\">Your Lyrics Destination</p>\n            </td>\n          </tr>\n\n          <!-- Cover Image -->\n          <tr>\n            <td style=\"padding: 24px 24px 16px;\">\n              <img src=\"/uploads/1769407351076-MV5BNWEwZmI0NzUtNTE1Ni00NTZmLWI4NjktN2VhZDYwYmQwZThkXkEyXkFqcGc-.-V1-FMjpg-UX1000-.jpg\" alt=\"Maatrubhumi\" style=\"width: 100%; height: 200px; object-fit: cover; border-radius: 12px; display: block;\">\n            </td>\n          </tr>\n\n          <!-- Song Details -->\n          <tr>\n            <td style=\"padding: 0 24px;\">\n              <h2 style=\"margin: 0 0 8px; color: #1e293b; font-size: 22px; font-weight: 700;\">Maatrubhumi</h2>\n              <p style=\"margin: 0 0 16px; color: #64748b; font-size: 14px;\">by Arijit Singh • 2026</p>\n            </td>\n          </tr>\n\n          <!-- Lyrics Excerpt -->\n          <tr>\n            <td style=\"padding: 0 24px;\">\n              <div style=\"background-color: #f8fafc; border-left: 3px solid #10b981; padding: 16px; border-radius: 0 8px 8px 0; margin-bottom: 24px;\">\n                <p style=\"margin: 0; color: #475569; font-size: 15px; line-height: 1.7; font-style: italic; white-space: pre-line;\">Matrubhumi aaj main sankalp loon tere liye\nMain jiyun tere liye aur main marun tere liye\nMeri jaan watan pe jaaye toh jiwan safal ho jaaye...</p>\n              </div>\n            </td>\n          </tr>\n\n          <!-- CTA Button -->\n          <tr>\n            <td style=\"padding: 0 24px 32px;\" align=\"center\">\n              <a href=\"http://localhost:3000/song/maatrubhumi\" style=\"display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 50px; font-size: 15px; font-weight: 600; box-shadow: 0 4px 14px rgba(16, 185, 129, 0.4);\">Read Full Lyrics</a>\n            </td>\n          </tr>\n\n          <!-- Divider -->\n          <tr>\n            <td style=\"padding: 0 24px;\">\n              <hr style=\"border: none; border-top: 1px solid #e2e8f0; margin: 0;\">\n            </td>\n          </tr>\n\n          <!-- Footer -->\n          <tr>\n            <td style=\"padding: 24px; text-align: center;\">\n              <p style=\"margin: 0 0 12px; color: #94a3b8; font-size: 13px;\">\n                <a href=\"http://localhost:3000\" style=\"color: #10b981; text-decoration: none;\">Visit DJYoungster</a>\n                <span style=\"margin: 0 8px;\">•</span>\n                <a href=\"http://localhost:3000/unsubscribe\" style=\"color: #94a3b8; text-decoration: none;\">Unsubscribe</a>\n              </p>\n              <p style=\"margin: 0; color: #cbd5e1; font-size: 12px;\">© 2026 DJYoungster. All rights reserved.</p>\n            </td>\n          </tr>\n\n        </table>\n      </td>\n    </tr>\n  </table>\n</body>\n</html>','sent','2026-01-26 09:03:01.481',1,0,0,'2026-01-26 09:03:01.483','2026-01-26 09:03:01.483'),('b52e5ed9-e6cb-411d-97a4-e388893e7d6c','🎵 New Lyrics: Maatrubhumi by Arijit Singh','<!DOCTYPE html>\n<html>\n<head>\n  <meta charset=\"utf-8\">\n  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n  <title>Maatrubhumi - New Lyrics on DJYoungster</title>\n</head>\n<body style=\"margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, sans-serif;\">\n  <table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" style=\"background-color: #f8fafc; padding: 40px 20px;\">\n    <tr>\n      <td align=\"center\">\n        <table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" style=\"max-width: 500px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);\">\n\n          <!-- Header -->\n          <tr>\n            <td style=\"background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 24px; text-align: center;\">\n              <h1 style=\"margin: 0; color: #ffffff; font-size: 24px; font-weight: 700;\">DJYoungster</h1>\n              <p style=\"margin: 8px 0 0; color: rgba(255,255,255,0.9); font-size: 14px;\">Your Lyrics Destination</p>\n            </td>\n          </tr>\n\n          <!-- Cover Image -->\n          <tr>\n            <td style=\"padding: 24px 24px 16px;\">\n              <img src=\"/uploads/1769407351076-MV5BNWEwZmI0NzUtNTE1Ni00NTZmLWI4NjktN2VhZDYwYmQwZThkXkEyXkFqcGc-.-V1-FMjpg-UX1000-.jpg\" alt=\"Maatrubhumi\" style=\"width: 100%; height: 200px; object-fit: cover; border-radius: 12px; display: block;\">\n            </td>\n          </tr>\n\n          <!-- Song Details -->\n          <tr>\n            <td style=\"padding: 0 24px;\">\n              <h2 style=\"margin: 0 0 8px; color: #1e293b; font-size: 22px; font-weight: 700;\">Maatrubhumi</h2>\n              <p style=\"margin: 0 0 16px; color: #64748b; font-size: 14px;\">by Arijit Singh • 2026</p>\n            </td>\n          </tr>\n\n          <!-- Lyrics Excerpt -->\n          <tr>\n            <td style=\"padding: 0 24px;\">\n              <div style=\"background-color: #f8fafc; border-left: 3px solid #10b981; padding: 16px; border-radius: 0 8px 8px 0; margin-bottom: 24px;\">\n                <p style=\"margin: 0; color: #475569; font-size: 15px; line-height: 1.7; font-style: italic; white-space: pre-line;\">Matrubhumi aaj main sankalp loon tere liye\nMain jiyun tere liye aur main marun tere liye\nMeri jaan watan pe jaaye toh jiwan safal ho jaaye...</p>\n              </div>\n            </td>\n          </tr>\n\n          <!-- CTA Button -->\n          <tr>\n            <td style=\"padding: 0 24px 32px;\" align=\"center\">\n              <a href=\"http://localhost:3000/song/maatrubhumi\" style=\"display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 50px; font-size: 15px; font-weight: 600; box-shadow: 0 4px 14px rgba(16, 185, 129, 0.4);\">Read Full Lyrics</a>\n            </td>\n          </tr>\n\n          <!-- Divider -->\n          <tr>\n            <td style=\"padding: 0 24px;\">\n              <hr style=\"border: none; border-top: 1px solid #e2e8f0; margin: 0;\">\n            </td>\n          </tr>\n\n          <!-- Footer -->\n          <tr>\n            <td style=\"padding: 24px; text-align: center;\">\n              <p style=\"margin: 0 0 12px; color: #94a3b8; font-size: 13px;\">\n                <a href=\"http://localhost:3000\" style=\"color: #10b981; text-decoration: none;\">Visit DJYoungster</a>\n                <span style=\"margin: 0 8px;\">•</span>\n                <a href=\"http://localhost:3000/unsubscribe\" style=\"color: #94a3b8; text-decoration: none;\">Unsubscribe</a>\n              </p>\n              <p style=\"margin: 0; color: #cbd5e1; font-size: 12px;\">© 2026 DJYoungster. All rights reserved.</p>\n            </td>\n          </tr>\n\n        </table>\n      </td>\n    </tr>\n  </table>\n</body>\n</html>','sent','2026-01-26 09:33:56.447',1,0,0,'2026-01-26 09:33:56.449','2026-01-26 09:33:56.449');
/*!40000 ALTER TABLE `newsletter` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `newslettersubscriber`
--

DROP TABLE IF EXISTS `newslettersubscriber`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `newslettersubscriber` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `subscribedAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `unsubscribedAt` datetime(3) DEFAULT NULL,
  `ipAddress` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `NewsletterSubscriber_email_key` (`email`),
  KEY `NewsletterSubscriber_email_idx` (`email`),
  KEY `NewsletterSubscriber_status_idx` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `newslettersubscriber`
--

LOCK TABLES `newslettersubscriber` WRITE;
/*!40000 ALTER TABLE `newslettersubscriber` DISABLE KEYS */;
INSERT INTO `newslettersubscriber` VALUES ('dc8c39a8-ff25-4d62-9cc7-805b4ade1d3e','nitinmonga14@gmail.com',NULL,'active','2026-01-26 07:15:53.319',NULL,'::1');
/*!40000 ALTER TABLE `newslettersubscriber` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `report`
--

DROP TABLE IF EXISTS `report`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `report` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `status` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `songId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reporterIp` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reporterEmail` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `Report_status_idx` (`status`),
  KEY `Report_songId_idx` (`songId`),
  CONSTRAINT `Report_songId_fkey` FOREIGN KEY (`songId`) REFERENCES `song` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `report`
--

LOCK TABLES `report` WRITE;
/*!40000 ALTER TABLE `report` DISABLE KEYS */;
INSERT INTO `report` VALUES ('347ee5a7-7eeb-42ae-aa77-941f50674304','artist',NULL,'reviewed','a5eb2c39-6ff0-42c7-965f-272e16eca8b0','::1',NULL,'2026-01-26 06:49:40.545','2026-01-26 06:50:58.336');
/*!40000 ALTER TABLE `report` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `siteseosettings`
--

DROP TABLE IF EXISTS `siteseosettings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `siteseosettings` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `pageKey` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `pageTitle` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `metaTitle` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `metaDescription` text COLLATE utf8mb4_unicode_ci,
  `metaKeywords` text COLLATE utf8mb4_unicode_ci,
  `ogTitle` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ogDescription` text COLLATE utf8mb4_unicode_ci,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `SiteSeoSettings_pageKey_key` (`pageKey`),
  KEY `SiteSeoSettings_pageKey_idx` (`pageKey`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `siteseosettings`
--

LOCK TABLES `siteseosettings` WRITE;
/*!40000 ALTER TABLE `siteseosettings` DISABLE KEYS */;
INSERT INTO `siteseosettings` VALUES ('0efaf170-aca9-463c-8166-29d45db29375','homepage','Homepage','2026 DJYoungster - Song Lyrics | Hindi, Punjabi, English Lyrics with Translations','DJYoungster is your ultimate destination for song lyrics. Find Hindi, Punjabi, English, Tamil, and Telugu song lyrics with translations.','song lyrics, hindi lyrics, punjabi lyrics, english lyrics, bollywood songs','DJYoungster - Song Lyrics | Hindi, Punjabi, English Lyrics with Translations','DJYoungster is your ultimate destination for song lyrics. Find Hindi, Punjabi, English, Tamil, and Telugu song lyrics with translations.','2026-01-26 13:04:46.408','2026-01-26 13:04:46.408');
/*!40000 ALTER TABLE `siteseosettings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `song`
--

DROP TABLE IF EXISTS `song`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `song` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `lyrics` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `duration` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `language` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `releaseYear` int DEFAULT NULL,
  `verified` tinyint(1) NOT NULL DEFAULT '0',
  `views` int NOT NULL DEFAULT '0',
  `status` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'published',
  `metaTitle` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `metaDescription` text COLLATE utf8mb4_unicode_ci,
  `coverImage` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  `albumId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `movieId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `youtubeUrl` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `composer` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `director` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `label` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `lyricist` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `producer` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `singers` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `spotifyUrl` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `starring` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `lyricsRomanized` text COLLATE utf8mb4_unicode_ci,
  `lyricsTranslated` text COLLATE utf8mb4_unicode_ci,
  `likes` int NOT NULL DEFAULT '0',
  `meaning` text COLLATE utf8mb4_unicode_ci,
  `lyricsHindi` text COLLATE utf8mb4_unicode_ci,
  `lyricsPunjabi` text COLLATE utf8mb4_unicode_ci,
  `appleMusicUrl` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Song_slug_key` (`slug`),
  KEY `Song_slug_idx` (`slug`),
  KEY `Song_title_idx` (`title`),
  KEY `Song_albumId_fkey` (`albumId`),
  KEY `Song_movieId_fkey` (`movieId`),
  CONSTRAINT `Song_albumId_fkey` FOREIGN KEY (`albumId`) REFERENCES `album` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `Song_movieId_fkey` FOREIGN KEY (`movieId`) REFERENCES `movie` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `song`
--

LOCK TABLES `song` WRITE;
/*!40000 ALTER TABLE `song` DISABLE KEYS */;
INSERT INTO `song` VALUES ('a5eb2c39-6ff0-42c7-965f-272e16eca8b0','Maatrubhumi','maatrubhumi','Matrubhumi aaj main sankalp loon tere liye\nMain jiyun tere liye aur main marun tere liye\nMeri jaan watan pe jaaye toh jiwan safal ho jaaye\nMeri jaan watan pe jaaye toh jiwan safal ho jaaye\nMeri jaan watan pe jaaye toh jiwan safal ho jaaye\nMeri jaan watan pe jaaye toh jiwan safal ho jaaye\n\nMatrubhumi aaj main sankalp loon tere liye\nMain jiyun tere liye aur main marun tere liye\nMeri jaan watan pe jaaye toh jiwan safal ho jaaye\nMeri jaan watan pe jaaye toh jiwan safal ho jaaye\n\nMatrubhumi aaj main sankalp loon tere liye\nMain jiyun tere liye aur main marun tere liye\nMeri jaan watan pe jaaye toh jiwan safal ho jaaye\nMeri jaan watan pe jaaye toh jiwan safal ho jaaye\nMeri jaan watan pe jaaye toh jiwan safal ho jaaye\nMeri jaan watan pe jaaye toh jiwan safal ho jaaye\n\nTujhpe nichhawar hai meri saansein\nMera toh sab kuchh mera watan\nHum bulbulen hai tu hai gulistan\nKhushbu se mehke tera chaman\n\nTujhpe mitegi zindagani\nTere hi dum se apni kahani\nYeh sarzameen hai shaan meri\nMitti mein teri hai aan meri\n\nSand** hum tere tu meri maa hai\nTujhpe hi qurban meri jaan hai\nTujhpe hi qurban meri jaan hai\n\nMatrubhumi aaj main sankalp loon tere liye\nMain jiyun tere liye aur main marun tere liye\nMeri jaan watan pe jaaye toh jiwan safal ho jaaye\nMeri jaan watan pe jaaye toh jiwan safal ho jaaye\n\nBhi humne li kasmein dushman ko hai mitana\nKya hai taaqat humari humko unko hai dikhana\nDesh pe tan man ko mitane abroo apni maa ki bachane\nRoke kisi ke hum na rukenge sar humare ab na jhukenge\n\nHum hai jiyaale hum toh hai toofaan\nDena hai humko har imtihaan\nHum toh likhenge daastaan woh\nDekhega jisko saara jahaan\n\nLeke tiranga hum toh chalenge\nJung apni toh jeet lenge\nKarte hai hum teri dege hawali\nApni ragon mein teri rawani\n\nTu hai maa abhimaan mera\nTere liye hai praan mera\nTere liye hai praan mera\n\nMatrubhumi aaj main sankalp loon tere liye\nMain jiyun tere liye aur main marun tere liye\nMeri jaan watan pe jaaye toh jiwan safal ho jaaye\nMeri jaan watan pe jaaye toh jiwan safal ho jaaye\nMeri jaan watan pe jaaye toh jiwan safal ho jaaye\nMeri jaan watan pe jaaye toh jiwan safal ho jaaye\nMeri jaan watan pe jaaye toh jiwan safal ho jaaye\nMeri jaan watan pe jaaye toh jiwan safal ho jaaye',NULL,'Hindi',2026,1,138,'published','Maatrubhumi Song Lyrics - Aaj main sankalp loon tere liye','Maatrubhumi Song Lyrics Matrubhumi aaj main sankalp loon tere liye Main jiyun tere liye aur main marun tere liye Meri jaan watan pe jaaye toh jiwan safal ho jaaye','/uploads/1769407351076-MV5BNWEwZmI0NzUtNTE1Ni00NTZmLWI4NjktN2VhZDYwYmQwZThkXkEyXkFqcGc-.-V1-FMjpg-UX1000-.jpg','2026-01-26 03:53:53.022','2026-01-27 05:12:49.702',NULL,'2c173b8c-bd98-4c54-85c6-900b0bf487c4','https://www.youtube.com/watch?v=1myT6aEMMhQ','Himesh Reshammiya','Apoorva Lakhia','Sony Music India','Sameer Anjaan','Himesh Reshammiya',NULL,'https://open.spotify.com/album/3VVXEAfuuOkBNg1HjY9sul','Salman Khan,Chitrangada Singh',NULL,NULL,1,'When he says “Meri jaan watan pe jaaye toh jiwan safal ho jaaye,” he’s declaring that the highest achievement for him is martyrdom.\nIt’s not sad, it’s portrayed as victory.','मातृभूमि आज मैं संकल्प लूँ तेरे लिए\nमैं जियूँ तेरे लिए और मैं मरूँ तेरे लिए\nमेरी जान वतन पे जाए तो जीवन सफल हो जाए\nमेरी जान वतन पे जाए तो जीवन सफल हो जाए\nमेरी जान वतन पे जाए तो जीवन सफल हो जाए\nमेरी जान वतन पे जाए तो जीवन सफल हो जाए\n\nमातृभूमि आज मैं संकल्प लूँ तेरे लिए\nमैं जियूँ तेरे लिए और मैं मरूँ तेरे लिए\nमेरी जान वतन पे जाए तो जीवन सफल हो जाए\nमेरी जान वतन पे जाए तो जीवन सफल हो जाए\n\nमातृभूमि आज मैं संकल्प लूँ तेरे लिए\nमैं जियूँ तेरे लिए और मैं मरूँ तेरे लिए\nमेरी जान वतन पे जाए तो जीवन सफल हो जाए\nमेरी जान वतन पे जाए तो जीवन सफल हो जाए\nमेरी जान वतन पे जाए तो जीवन सफल हो जाए\nमेरी जान वतन पे जाए तो जीवन सफल हो जाए\n\nतुझपे निछावर हैं मेरी साँसें\nमेरा तो सब कुछ मेरा वतन\nहम बुलबुले हैं तू है गुलिस्ताँ\nखुशबू से महके तेरा चमन\n\nतुझपे मिटेगी ज़िंदगानी\nतेरे ही दम से अपनी कहानी\nये सरज़मीं है शान मेरी\nमिट्टी में तेरी है आन मेरी\n\nसंदेह? हम तेरे तू मेरी माँ है\nतुझपे ही क़ुर्बान मेरी जान है\nतुझपे ही क़ुर्बान मेरी जान है\n\nमातृभूमि आज मैं संकल्प लूँ तेरे लिए\nमैं जियूँ तेरे लिए और मैं मरूँ तेरे लिए\nमेरी जान वतन पे जाए तो जीवन सफल हो जाए\nमेरी जान वतन पे जाए तो जीवन सफल हो जाए\n\nभी हमने ली क़समें दुश्मन को है मिटाना\nक्या है ताक़त हमारी हमको उनको है दिखाना\nदेश पे तन-मन को मिटाने\nआबरू अपनी माँ की बचाने\nरोके किसी के हम न रुकेंगे\nसर हमारे अब न झुकेंगे\n\nहम हैं जियाले हम तो हैं तूफ़ान\nदेना है हमको हर इम्तेहान\nहम तो लिखेंगे दास्ताँ वो\nदेखेगा जिसको सारा जहाँ\n\nलेके तिरंगा हम तो चलेंगे\nजंग अपनी तो जीत लेंगे\nकरते हैं हम तेरी दी गई हवाली\nअपनी रगों में तेरी रवानी\n\nतू है माँ अभिमान मेरा\nतेरे लिए है प्राण मेरा\nतेरे लिए है प्राण मेरा\n\nमातृभूमि आज मैं संकल्प लूँ तेरे लिए\nमैं जियूँ तेरे लिए और मैं मरूँ तेरे लिए\nमेरी जान वतन पे जाए तो जीवन सफल हो जाए\nमेरी जान वतन पे जाए तो जीवन सफल हो जाए\nमेरी जान वतन पे जाए तो जीवन सफल हो जाए\nमेरी जान वतन पे जाए तो जीवन सफल हो जाए\nमेरी जान वतन पे जाए तो जीवन सफल हो जाए\nमेरी जान वतन पे जाए तो जीवन सफल हो जाए\n',NULL,NULL),('aad0ecd1-de45-4df1-9363-1f4853c099d0','Aise Des','aise-des','Jithe koi maili soch na mere dushman vekhe\nJithe sachha ishq qabool hove te lagje lekhe\nJithe heer deke chamm na vikda gali gali ve\nKithe bachpan wali titli udd gayi fadi fadi ve\n\nHo jithe kheddan tappa rova hassa meri marzi naal\nHaye ishq kara ya jogan hoke kalli vassa marzi naal\nHoye jithe muh te ni lagde pais ve main jana uss desh\nVe main jaana ae aise des ve main jaana ae aise des\nVe main jaana ae aise desh\n\nKhol aava maa meri de vehde banne khwab kude\nOhde pairan di mitti de ho jaande dhanbhag kude\nOhdi ungli fadke sikheya udna ve main ambaran te\nVaari javaan jinne meri soch nu laayi jaag kude\n\nJithe likhde ne aape les ve main jaana ae aise des\nVe main jaana ae aise des ve main jaana ae aise des\nVe main jaana ae aise des\n\nRakh supne vich terela peed gavada mele ve\nIshq dahi da kuchha jamme zind mora vich mele ve\nHo gayi kahani charkhe butta kook pave vich galiyan de\nNitt koi phool khid\'da hove charo jungle belle ve\n\nRaati supne da lai lakhes ve main jana aise des\nVe main jaana ae aise des ve main jaana ae aise des\nVe main jaana ae aise des..\n\nChal tainu dikhawaan hawa naal kivein bolna ae\nAsmana de rang paani da rola te pathhran de jho\nChal phulkari diyan cheediyan wangu udd cahliye\nBanajr takkiye jugnu faddiye mitti kolo raste puchhiye\nTe mudke kade ni kaidi hona tainu teri rooh da vaasta ae\n',NULL,NULL,2026,1,10,'published','Aise Des Song Lyrics - Sunanda Sharma','Aise Des Song Lyrics reflect a nostalgic world where purity, childhood joy, and true love still exist. Understand the song’s essence with full lyrics and detailed meaning.','/uploads/1769434086882-sunanda-ss-1768902274-3814151186845747068-1960858876.jpg.jpeg','2026-01-26 13:35:29.560','2026-01-26 13:39:56.255',NULL,NULL,'https://www.youtube.com/watch?v=Yxda_q7X-Og','Gaurav Dev','Avex Dhillon','Mic & Me','Raj Ranjodh',NULL,NULL,NULL,'Sunanda Sharma',NULL,NULL,1,'Aise Des track is basically a nostalgic fantasy about a pure, innocent homeland that doesn’t really exist anymore. She’s dreaming of a place where love is honest, childhood joy isn’t corrupted, and money or ego don’t define people. It’s a poetic escape toward that “ideal country” where the soul finally feels at home.','जिथे कोई मैली सोच ना मेरे दुश्मन वेखे\nजिथे सच्चा इश्क क़बूल होवे ते लगजे लेखे\nजिथे हीर देके चम्म ना विकदा गली गली वे\nकिथे बचपन वाली तितली उड गई फड़ी फड़ी वे\n\nहो जिथे खेड़दां तप्पा रोवा हस्सा मेरी मर्ज़ी नाल\nहाये इश्क करा या जोगन होके कल्ली वस्सा मर्ज़ी नाल\nहोए जिथे मुह ते नी लगदे पैस वे मैं जाणा उस देश\nवे मैं जाना ऐ ऐसे देस वे मैं जाना ऐ ऐसे देस\nवे मैं जाना ऐ ऐसे देश\n\nखोल आवा माँ मेरी दे वेहदे बनने ख्वाब कुदे\nओहदे पैरन दी मिट्टी दे हो जांदे धनभाग कुदे\nओहदी उंगली फड़के सिखेया उडना वे मैं अंबरन ते\nवारी जवां जिन्ने मेरी सोच नु लाई जाग कुदे\n\nजिथे लिखदे ने आपे लेस वे मैं जाना ऐ ऐसे देस\nवे मैं जाना ऐ ऐसे देस वे मैं जाना ऐ ऐसे देस\nवे मैं जाना ऐ ऐसे देश\n\nरख सपने विच तेरेला पीड़ गवादा मेले वे\nइश्क दहि दा कुछा जम्मे ज़िंद मोरा विच मेले वे\nहो गई कहानी चरखे बुट्टा कूक पावे विच गलियां दे\nनित्त कोई फूल खिड़दा होवे चारो जंगल बेल्ले वे\n\nराती सपने दा ला लाखेस वे मैं जाना ऐसे देस\nवे मैं जाना ऐ ऐसे देस वे मैं जाना ऐ ऐसे देस\nवे मैं जाना ऐ ऐसे देस..\n\nचल तैनूं दिखावां हवा नाल किवें बोलना ऐ\nआसमाना दे रंग पानी दा रोला ते पथरां दे झो\nचल फुलकारी दियां चीदियां वंगू उद्द चाहलिए\nबनज़र टक्किए जुगनू फड़ीए मिट्टी कोलो रस्ते पुछिए\nते मुड़के कदे नी कैदी होना तैनूं तेरी रूह दा वास्ता ऐ',NULL,NULL);
/*!40000 ALTER TABLE `song` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `songartist`
--

DROP TABLE IF EXISTS `songartist`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `songartist` (
  `songId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `artistId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`songId`,`artistId`),
  KEY `SongArtist_artistId_fkey` (`artistId`),
  CONSTRAINT `SongArtist_artistId_fkey` FOREIGN KEY (`artistId`) REFERENCES `artist` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `SongArtist_songId_fkey` FOREIGN KEY (`songId`) REFERENCES `song` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `songartist`
--

LOCK TABLES `songartist` WRITE;
/*!40000 ALTER TABLE `songartist` DISABLE KEYS */;
INSERT INTO `songartist` VALUES ('a5eb2c39-6ff0-42c7-965f-272e16eca8b0','00ceab27-2ee5-4720-beec-9db4685ea7e1'),('a5eb2c39-6ff0-42c7-965f-272e16eca8b0','20ce577e-0830-4a9d-b8ad-fe5cc3eb749a'),('aad0ecd1-de45-4df1-9363-1f4853c099d0','b32910e1-61ea-418b-b116-1eaa90ecfef5');
/*!40000 ALTER TABLE `songartist` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `songcategory`
--

DROP TABLE IF EXISTS `songcategory`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `songcategory` (
  `songId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `categoryId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`songId`,`categoryId`),
  KEY `SongCategory_categoryId_fkey` (`categoryId`),
  CONSTRAINT `SongCategory_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `category` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `SongCategory_songId_fkey` FOREIGN KEY (`songId`) REFERENCES `song` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `songcategory`
--

LOCK TABLES `songcategory` WRITE;
/*!40000 ALTER TABLE `songcategory` DISABLE KEYS */;
INSERT INTO `songcategory` VALUES ('aad0ecd1-de45-4df1-9363-1f4853c099d0','55161057-89a2-4680-9bd0-c42de2b92ce8'),('a5eb2c39-6ff0-42c7-965f-272e16eca8b0','d8b52881-8532-44d6-afa8-e86ae937fb82');
/*!40000 ALTER TABLE `songcategory` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `songgenre`
--

DROP TABLE IF EXISTS `songgenre`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `songgenre` (
  `songId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `genreId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`songId`,`genreId`),
  KEY `SongGenre_genreId_fkey` (`genreId`),
  CONSTRAINT `SongGenre_genreId_fkey` FOREIGN KEY (`genreId`) REFERENCES `genre` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `SongGenre_songId_fkey` FOREIGN KEY (`songId`) REFERENCES `song` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `songgenre`
--

LOCK TABLES `songgenre` WRITE;
/*!40000 ALTER TABLE `songgenre` DISABLE KEYS */;
INSERT INTO `songgenre` VALUES ('a5eb2c39-6ff0-42c7-965f-272e16eca8b0','1cef0d6d-db5d-4509-9621-ded008551143'),('aad0ecd1-de45-4df1-9363-1f4853c099d0','1cef0d6d-db5d-4509-9621-ded008551143');
/*!40000 ALTER TABLE `songgenre` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `songlike`
--

DROP TABLE IF EXISTS `songlike`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `songlike` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `songId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ipAddress` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `SongLike_songId_ipAddress_key` (`songId`,`ipAddress`),
  KEY `SongLike_songId_idx` (`songId`),
  KEY `SongLike_ipAddress_idx` (`ipAddress`),
  CONSTRAINT `SongLike_songId_fkey` FOREIGN KEY (`songId`) REFERENCES `song` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `songlike`
--

LOCK TABLES `songlike` WRITE;
/*!40000 ALTER TABLE `songlike` DISABLE KEYS */;
INSERT INTO `songlike` VALUES ('4147d0a7-1415-46a9-bc0f-258b48e25585','a5eb2c39-6ff0-42c7-965f-272e16eca8b0','::1','2026-01-26 09:27:21.327'),('7a0cfc4a-022b-49fc-b034-c7a5546e9b60','aad0ecd1-de45-4df1-9363-1f4853c099d0','::1','2026-01-26 13:36:06.815');
/*!40000 ALTER TABLE `songlike` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-01-27 16:25:34
