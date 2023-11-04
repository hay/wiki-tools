# Hay's wiki tools
Source code for all of my [wiki tools](http://tools.wmflabs.org/hay/)

## Setup
* Create a `config.php` file (use `config-sample.php` as an example) in the `lib` directory.
    * If you plan on using docker-compose you can `require_once __DIR__ . '/../.docker-compose/config.php';`, which defines many things automatically.
* Do a `composer install` in the lib/ directory. For this you need [Composer](http://getcomposer.org).
* Do a `bower install` in the root directory. For this you need Bower `npm install -g bower`.
* Some tools (like VizQuery, or Depictor) need an `npm install` or `composer install` in their root as well.
    * VizQuery also needs a 'npm run build' to build the bundle.

### Setting up your own OAuth consumer for Depictor
Here are some OAuth consumer references to help you during setup: [Depictor production on Commons](https://commons.wikimedia.org/w/index.php?title=Special:OAuthListConsumers/view/835a3d29eaa9b09690603b9898320b86&name=Depictor&publisher=&stage=1), [Addshores local development on meta](https://meta.wikimedia.org/wiki/Special:OAuthListConsumers/view/41d2d900ec9f6a20be76994a0eae1ecf).

You can setup your own local development consumer by following these steps:
* Navigate to an OAuth setup page:
    * For Commons: https://commons.wikimedia.org/wiki/Special:OAuthConsumerRegistration/propose
    * For Meta: https://meta.wikimedia.org/wiki/Special:OAuthConsumerRegistration/propose
* Select `Propose an OAuth 1.0a consumer.`
* For development, use a name such as `<username>-local-dev`, or `<username>-depictor-dev`.
* For the callback URL
    * You can use something such as `http://localhost`, choosing to point requests to the correct location when they appear in your browser
    * Hardcode something like `http://localhost:4080/depictor/index.php`, which should work with the default configured docker-compose setup
* Applicable projects: `Commons` must be selected
* Request:
    * High-volume (bot) access
    * Edit existing pages

You will then be provided a key and secret that you need to define in `OAUTH_DEPICTOR` in your `config.php` file.

## Running it (Docker)
* Run `docker-compose up -d` to start the containers.
* Navigate to http://localhost:4080/ to see the tools.

## Running it (Classic)
* Get a webserver with PHP, and host the needed files
* Configure the `config.php` file to reflect where these files will be served
* Setup MySQL, inclusing creating the tables you can find in various `.sql` files

## Remarks
* To generate the `props.html` file that is used in the Wikidata Property browser, either:
    * Run the `get-wikidata-props.py` script located in `etc/wikidata-props`
    * Or if you're lazy simply download it from the live site: http://tools.wmflabs.org/hay/propbrowse/props.html

## License
All code is licensed under the terms of the [MIT / X11](http://opensource.org/licenses/MIT) license.

## Credits
Some of this stuff was written for my work as [Wikipedian in Residence](https://nl.wikipedia.org/wiki/Wikipedia:GLAM/KBNA) at the Dutch [National Library](http://www.kb.nl) and [National Archive](http://www.gahetna.nl).
