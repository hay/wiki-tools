export default {
    host: 'wikidata.org',

    js() {
        // Add a hyperlink to items with a 'relative position within image'
        // (P2677) qualifier on the 'depicts' (P180) property to a viewer
        // that uses the IIIF protocol to make a crop of a picture.
        (function() {
            // First declare the viewer endpoint and a shortcut for jQuery
            const VIEWER = 'https://tools.wmflabs.org/zoomviewer/proxy.php';
            const $ = window.jQuery;

            // Get the first image, we assume that's the main one
            // If there's no picture on this item, stop the whole process
            const imgProp = $('[title="Property:P18"]');

            if (!imgProp.length) {
                // No images, stop this whole thing
                return;
            }

            // Now get the first image and get the commons filename
            let imgVal = imgProp
                .parents('.wikibase-statementgroupview')
                .find('.commons-media-caption a');

            if (!imgVal.length) {
                // No image values
                return;
            }

            // Get the first src
            const imgSrc = $(imgVal[0]).text();

            // Now loop through all P2677 qualifiers and transform the
            // crop to the viewer link
            const posProps = $('[title="Property:P2677"]');

            if (!posProps.length) {
                // No props, skip this
                return;
            }

            // Okay, now loop over all those props
            posProps.get().forEach((posProp) => {
                // And loop over all the values as well
                const posValues = $(posProp)
                    .parents('.wikibase-snaklistview')
                    .find('.wikibase-snakview-value');

                posValues.get().forEach((posVal) => {
                    // Get the location as a string and add that, together
                    // with the image we got earlier, to the viewer link
                    // and wrap the value in a hyperlink containing the
                    // crop
                    const posLoc = $(posVal).text();
                    const url = `${VIEWER}?iiif=${imgSrc}/${posLoc}/full/0/default.jpg`;
                    $(posVal).wrap(`<a href="${url}" target="_blank"></a>`);
                });
            });
        })();
    }
};