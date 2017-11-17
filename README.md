# Hay's wiki tools
Source code for all of my [wiki tools](http://tools.wmflabs.org/hay/)

## Running it
* Create a `config.php` file (use `config-sample.php` as an example) in the `lib` directory.
* Do a `composer install` in the lib/ directory. For this you need [Composer](http://getcomposer.org).
* Do a `bower init` in the root directory
* Some tools (like VizQuery) need a `npm install` in their root as well. VizQuery also needs a 'npm run build' to build the bundle.

## Remarks
* To generate the `props.html` file that is used in the Wikidata Property browser, either:
    * Run the `get-wikidata-props.py` script located in `etc/wikidata-props`
    * Or if you're lazy simply download it from the live site: http://tools.wmflabs.org/hay/propbrowse/props.html

## License
All code is licensed under the terms of the [MIT / X11](http://opensource.org/licenses/MIT) license.

## Credits
Some of this stuff was written for my work as [Wikipedian in Residence](https://nl.wikipedia.org/wiki/Wikipedia:GLAM/KBNA) at the Dutch [National Library](http://www.kb.nl) and [National Archive](http://www.gahetna.nl).
