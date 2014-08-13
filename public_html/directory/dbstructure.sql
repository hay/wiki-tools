CREATE TABLE `tools` (
  `id` bigint(11) unsigned NOT NULL AUTO_INCREMENT,
  `name` text,
  `title` text NOT NULL,
  `jsonurl` text,
  `description` text,
  `url` text,
  `keywords` text,
  `author` text,
  `unavailable` tinyint(1) NOT NULL,
  `deleted` tinyint(1) NOT NULL,
  `redirects` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;