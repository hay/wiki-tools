SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

CREATE TABLE `tools` (
  `id` bigint(11) unsigned NOT NULL AUTO_INCREMENT,
  `name` text,
  `title` text NOT NULL,
  `jsonurl` text,
  `added` text NOT NULL,
  `description` text,
  `url` text,
  `keywords` text,
  `author` text,
  `repository` text NOT NULL,
  `unavailable` tinyint(1) NOT NULL,
  `deleted` tinyint(1) NOT NULL,
  `redirects` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8;
