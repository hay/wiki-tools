CREATE TABLE `tools` (
  `id` bigint(11) unsigned NOT NULL AUTO_INCREMENT,
  `jsonurl` text,
  `name` text,
  `description` text,
  `url` text,
  `keywords` text,
  `author` text,
  `unavailable` tinyint(1) NOT NULL,
  `deleted` tinyint(1) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=1;