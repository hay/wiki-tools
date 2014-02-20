import requests, json, re

API_ENDPOINT = "http://%s.wikipedia.org/w/api.php";

def request(lang, params):
    url = API_ENDPOINT % lang
    r = requests.get(url, params = params)

    data = r.json()

    return data

def define(args):
    q = args["q"]
    lang = args["lang"] if "lang" in args else "en"

    data = request(lang, {
        "action" : "query",
        "prop" : "extracts",
        "format" : "json",
        "exintro" : 1,
        "titles" : q
    })

    # Sigh.. awful Wikipedia API crap
    pageid = data['query']['pages'].keys()[0]

    if "-1" in data["query"]["pages"]:
        return False
    else :
        page = data["query"]["pages"][pageid]

        # A bit ugly, but oh well
        page['extract'] = re.sub('<[^<]+?>', '', page['extract']).strip()

        return page

def suggest(args):
    q = args["q"]
    lang = args["lang"] if "lang" in args else "en'"

    data = request(lang, {
        "action" : "opensearch",
        "format" : "json",
        "search" : q,
        "suggest" : 1
    });

    return {
        "query" : q,
        "suggestions" : data[1]
    }