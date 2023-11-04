# ************************************************************
# Sequel Ace SQL dump
# Version 20056
#
# https://sequel-ace.com/
# https://github.com/Sequel-Ace/Sequel-Ace
#
# Host: tools-db (MySQL 5.5.5-10.4.29-MariaDB-log)
# Database: s51409__hay
# Generation Time: 2023-11-04 12:47:46 +0000
# ************************************************************


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
SET NAMES utf8mb4;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE='NO_AUTO_VALUE_ON_ZERO', SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


# Dump of table depictor_challenges
# ------------------------------------------------------------

DROP TABLE IF EXISTS `depictor_challenges`;

CREATE TABLE `depictor_challenges` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `querytype` varchar(32) DEFAULT NULL,
  `queryvalue` text DEFAULT NULL,
  `title` varchar(100) DEFAULT NULL,
  `short_description` varchar(150) DEFAULT '',
  `long_description` text DEFAULT NULL,
  `user` varchar(255) DEFAULT NULL,
  `created` varchar(32) DEFAULT NULL,
  `itemcount` int(11) DEFAULT NULL,
  `archived` tinyint(1) DEFAULT NULL,
  `last_edit` varchar(32) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;



# Dump of table depictor_files
# ------------------------------------------------------------

DROP TABLE IF EXISTS `depictor_files`;

CREATE TABLE `depictor_files` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `mid` varchar(64) DEFAULT NULL,
  `qid` varchar(64) DEFAULT NULL,
  `category` varchar(255) DEFAULT '',
  `status` enum('depicted','not-depicted','user-skipped','prominently-depicted') DEFAULT NULL,
  `timestamp` varchar(32) DEFAULT NULL,
  `user` varchar(255) DEFAULT NULL,
  `challenge` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;



# Dump of table depictor_items
# ------------------------------------------------------------

DROP TABLE IF EXISTS `depictor_items`;

CREATE TABLE `depictor_items` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `qid` varchar(64) DEFAULT NULL,
  `status` enum('done') DEFAULT NULL,
  `timestamp` varchar(32) DEFAULT NULL,
  `user` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;




/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
