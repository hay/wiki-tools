(function(d) {
    var links = document.querySelectorAll('.link_gen');
    var link = [].slice.call(links).filter(function(l) {
        return l.href.indexOf("PPN") !== -1 && l.href.indexOf('SAVEINFO') !== -1;
    });

    if (!link.length) {
        alert("No PPN found for this record :(");
        return;
    }

    var ppn = link[0].href.match(/PPN=(\d\w*)/)[1];
    var url = "http://opc4.kb.nl/PPN?PPN=" + ppn;
    window.prompt("Here's the permalink", url);
})(document);