import json, requests

DBPEDIA_LOOKUP_ENDPOINT = "http://lookup.dbpedia.org/api/search.asmx/"

def query(url, params):
    url = DBPEDIA_LOOKUP_ENDPOINT + "KeywordSearch"

    r = requests.get(url,
        headers = {
            "Accept" : "application/json"
        },
        params = params
    )

    return r.json()


def suggest(args):
    q = args["q"]
    limit = args["limit"] if "limit" in args else 10

    res = query(
        DBPEDIA_LOOKUP_ENDPOINT + "PrefixSearch",
        {
            "QueryString" : q,
            "MaxHits" : limit
        }
    )

    if ('results' not in res) or (len(res['results']) == 0):
        return False


    return {
        "query" : params["q"],
        "suggestions" : map(lambda i:i["label"], res["results"])
    }

def define(args):
    q = args["q"]

    res = query(
        DBPEDIA_LOOKUP_ENDPOINT + "KeywordSearch",
        {
            "QueryString" : q,
            "MaxHits" : 1
        }
    )

    if ('results' not in res) or (len(res['results']) == 0):
        return False

    return {
        "query" : q,
        "definition" : res['results'][0]['description']
    }