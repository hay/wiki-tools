/*
 * Get all the third-party formatted urls for a identifer
 * By request of Andy Mabbet: https://www.wikidata.org/w/index.php?title=User_talk:Husky&oldid=725779462#User_script_request_for_P3303
 *
 * How to use :  Add to your common.js [[Special:MyPage/common.js]]:                              *
 * importScript( 'User:Husky/thirdpartyformatters.js' );
 */
const fn = function() {
    function getQuery(prop, language = 'en') {
        return `
            select ?formatter ?operatorLabel where {
              wd:${prop} p:P3303 ?claim.
              ?claim pq:P137 ?operator.
              ?claim ps:P3303 ?formatter.
              SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE], ${language}". }
            }
        `;
    }

    async function getFormattersForProperty(pid) {
        const query = getQuery(pid, USER_LANGUAGE);
        const endpoint = `https://query.wikidata.org/sparql?query=${query}&format=json`;
        const req = await fetch(endpoint);
        const data = await req.json();
        return data.results.bindings;
    }

    const BUTTON_CSS = {
        background : 'none',
        border : 0,
        color : '#0645ad',
        cursor : 'pointer',
        padding : '10px',
        'font-size' : '12px'
    };

    const $ = window.jQuery;
    const USER_LANGUAGE = mw.config.get('wgUserLanguage');

    // First get all the properties that have an external id
    const ids = $(".wikibase-statementgroupview .wb-external-id").get().map((id, index) => {
        const $id = $(id);
        const identifier = $id.text();
        const $parent = $id.parents('.wikibase-statementgroupview');
        const pid = $parent
            .find(".wikibase-statementgroupview-property-label a")
            .attr('title')
            .replace('Property:', '');

        const $wrapper = $(`<div class="tplinks__wrapper" data-tplinks="${index}"></div>`);
        const $btn = $(`<button>Get third-party links</button>`);
        $btn.css(BUTTON_CSS);
        $wrapper.append($btn);
        $parent.find(".wikibase-statementview-qualifiers").append($wrapper);

        return { identifier, $id, $parent, pid };
    });

    $("body").on('click', '[data-tplinks] button', async function(e) {
        const $el = $(e.target).parent();
        const index = $el.data('tplinks');
        const idData = ids[index];
        const pid = idData.pid;

        $el.html(`<span>Getting formatters for ${pid}`);
        const data = await getFormattersForProperty(idData.pid);

        if (!data.length) {
            $el.html(`<span>No third party formatters for ${pid}`);
        } else {
            const links = data.map((val) => {
                const url = val.formatter.value.replace('$1', idData.identifier);
                const label = val.operatorLabel.value;
                return `<li><a href="${url}" target="_blank">${label}</a></li>`;
            });

            const html = `<ul>${links.join('')}</ul>`;
            console.log(html);
            $el.html(html);
        }
    });
};

export default {}

/*
export default {
    host : 'wikidata.org',
    js : fn
}
*/