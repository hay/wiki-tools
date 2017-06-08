from math import ceil
from dictquery import DictQuery
from wikidatatypes import TYPES
from operator import itemgetter
import requests, json, pdb, jinja2, os

ENDPOINT = "https://www.wikidata.org/w/api.php"
PROP_NAMESPACE = 120
QUERY_LIMIT = 50
PATH = os.path.dirname(os.path.realpath(__file__))
SAVE_DIRECTORY = PATH + "/../../public_html/propbrowse/"

def render(data):
    env = jinja2.Environment(
        trim_blocks = True,
        lstrip_blocks = True
    )
    with open(PATH + "/../../templates/propbrowse-list.html") as template:
        tmpl = env.from_string(template.read())
        return tmpl.render(data)

def parseprop(item):
    prop = DictQuery(item)

    data = {
        "datatype" : prop.get("datatype"),
        "id" : prop["id"],
        "label" : prop.get("labels/en/value"),
        "description" : prop.get("descriptions/en/value"),
        "aliases" : [a["value"] for a in prop.get("aliases/en")]
    }

    example = prop.get("claims/P1855/mainsnak/datavalue/value/numeric-id")

    if isinstance(example, list) and example[0] != None:
        data["example"] = example

    types = prop.get("claims/P31/mainsnak/datavalue/value/numeric-id")

    if isinstance(types, list):
        data["types"] = filter(None, [TYPES.get("Q%s" % qid) for qid in types])

    return data

def get_prop_info(ids):
    print "get_prop_info %s" % ",".join(ids)

    params = {
        "action" : "wbgetentities",
        "ids" : "|".join(ids),
        "languages" : "en",
        "format" : "json",
        "props" : "info|aliases|labels|descriptions|claims|datatype",
        "languagefallback" : 1
    }

    r = requests.get(ENDPOINT, params = params)
    return r.json()["entities"].values()

def get_prop_ids(cont = None):
    print "get_prop_ids %s" % cont

    params = {
        "action" : "query",
        "list" : "allpages",
        "apnamespace" : PROP_NAMESPACE,
        "aplimit" : 500,
        "format" : "json"
    }

    if cont:
        params["apcontinue"] = cont

    r = requests.get(ENDPOINT, params = params)
    return r.json()


def get_all_prop_ids():
    allprops = []

    cont = None

    while True:
        data = get_prop_ids(cont)

        for page in data["query"]["allpages"]:
            allprops.append(page["title"].replace("Property:", ""))

        if "continue" in data:
            cont = data["continue"]["apcontinue"]
        else:
            break

    return allprops

def main():
    props = []

    print "Getting all property ids"
    propids = get_all_prop_ids()

    maxrange = ceil( len(propids) / float(QUERY_LIMIT) )

    for index in range(0, int(maxrange)):
        realindex = index * QUERY_LIMIT
        ids = propids[realindex:realindex + QUERY_LIMIT]

        for p in get_prop_info(ids):
            props.append(parseprop(p))

    # Sort by label
    props = sorted(props, key = itemgetter("label"))

    jsonpath = SAVE_DIRECTORY + "props.json"
    print("Saving to " + jsonpath)

    with open(jsonpath, "w") as jsonprops:
        jsonprops.write(json.dumps(props))

def main_from_json():
    with open(SAVE_DIRECTORY + "props.json") as f:
        props = json.loads(f.read())
        html = render({ "props" : props })

        with open(SAVE_DIRECTORY + "props.html", "w") as table:
            table.write(html.encode('utf-8'))

if __name__ == "__main__":
    main()