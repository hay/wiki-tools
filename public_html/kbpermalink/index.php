<?php
    require '../../lib/class-hay.php';
    $hay = new Hay("kbpermalink");

    $hay->header();
?>
        <h1><?php $hay->title(); ?></h1>

        <p class="lead"><?php $hay->description(); ?></p>

        <p>Many libraries use the OCLC PICA software, such as the <a href="http://opc4.kb.nl/">catalogue of the Koninklijke Bibliotheek</a> (Dutch National Library) or the <a href="http://bibliotheek.gahetna.nl">Dutch National Archive</a>. Unfortunately, it's not very user-friendly, and there's no easy way from the interface to generate a permalink to a record. When browsing search results the URL bar doesn't properly change to a permalink, and hitting 'refresh' or opening it in another browser deletes your history. </p>

        <p>However, with this small <a href="https://en.wikipedia.org/wiki/Bookmarklet">bookmarklet</a> you can add a small button to your browser that automatically generates a permalink from any book page.</p>

        <p>To use it, simply drag the button below to your bookmark bar, and press it whenever you are on a book record page in the catalogue.</p>

        <a class="btn btn-large btn-primary" href="javascript:var%20s%20%3D%20document.createElement(%27script%27)%3Bs.src%20%3D%20%27http%3A%2F%2Ftools.wmflabs.org%2Fhay%2Fkbpermalink%2Fkbpermalink.js%27%3Bdocument.body.appendChild(s)%3Bvoid(0)%3B">Pica Permalink</a>
<?php
    Hay::footer();
?>