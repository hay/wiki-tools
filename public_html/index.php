<?php
    require '../lib/class-hay.php';
    Hay::header();
?>
        <h1>Hay's tools</h1>

        <p>Hello. I'm <a href="http://www.haykranen.nl">Hay Kranen</a> and this is a list of some tools i've made. Until July 2014 i'm the <a href="https://en.wikipedia.org/wiki/Wikipedia:GLAM/KBNA">Wikipedian in Residence</a> for the Dutch <a href="http://www.gahetna.nl">National Archive</a> (Nationaal Archief) and the <a href="http://www.kb.nl">National Library</a> (Koninklijke Bibliotheek).</p>

        <p>If you want to get in contact send me an <a href="mailto:hay@wikimedia.nl">mail</a> or leave a message on my <a href="https://en.wikipedia.org/wiki/User_talk:Husky">Talk page</a>. I'm also on <a href="http://www.twitter.com/hayify">Twitter</a>.</p>

        <p>Note: on Wikipedia i'm also known as <a href="http://en.wikipedia.org/wiki/User:Husky">Husky</a>.</p>

        <h2>Tools</h2>

        <dl class="dl-horizontal">
            <dt><a href="exturl/">External URL stats</a></dt>
            <dd>A better <a href="https://meta.wikimedia.org/wiki/Help:Linksearch">External links search</a>. Collates all the links so you can view which pages have the most external links to a pattern.</dd>

            <dt><a href="gtaa/">GTAA Reasonator</a></dt>
            <dd>A <a href="http://tools.wmflabs.org/reasonator/">Reasonator</a>-like tool for <a href="https://sites.google.com/a/beeldengeluid.nl/gtaa">GTAA</a> ID's.</dd>

            <dt><a href="kbpermalink/">Pica Permalink</a></dt>
            <dd>A bookmarklet to generate a permalink for the catalogue of the Dutch National Library (Koninklijke Bibliotheek) or any other Pica/OCLC catalogue</dd>

            <dt><a href="nadownload/">NA Download</a></dt>
            <dd>Download all images from a Dutch National Archive inventory</dd>

            <dt><a href="nasearch/">NA Search</a></dt>
            <dd>Bulk search the NA image archives</dd>

            <!-- This tool is really of no use
            <dt><a href="natranscript/">NA Transcript</a></dt>
            <dd>Download transcripts of archive pieces</dd>
            -->

            <dt><a href="streetwiki/">Streetwiki</a></dt>
            <dd>View Wikipedia articles in Google Maps &amp; Street View</dd>
        </dl>

        <h2>Misc.</h2>

        <p>Code for all of these tools is on <a href="https://github.com/hay/wiki-tools">Github</a>.</p>
<?php
    Hay::footer();
?>