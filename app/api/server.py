import wpapi, bengwikiapi, dbpedia_lookup_api, kbapi

from flask import Flask, request
from apirequest import ApiRequest

app = Flask(__name__)

@app.route('/kb/search')
def search():
    r = ApiRequest(
        method = kbapi.get_search,
        name = "kb/search"
    )

    r.add_param("q")

    return r.call()

@app.route('/kb/item')
def item():
    if 'isbn' in request.args:
        method = kbapi.get_isbn
        param = "isbn"
    elif "ppn" in request.args:
        method = kbapi.get_ppn
        param = "ppn"
    else:
        return ApiRequest.error("invalid parameter")

    r = ApiRequest(
        method = method,
        name = "kb/item"
    )

    r.add_param(param)

    return r.call()

@app.route('/dbpedia/define')
def dbpedia_define():
    r = ApiRequest(
        method = dbpedia_lookup_api.define,
        name = "dbpedia/define"
    )

    r.add_param("q")

    return r.call()


@app.route("/dbpedia/suggest")
def suggest():
    r = ApiRequest(
        method = dbpedia_lookup_api.suggest,
        name = "dbpedia/suggest"
    )

    r.add_param("q")
    r.add_param("limit", default = None)

    return r.call()

@app.route("/bengwiki/infobox")
def infobox():
    r = ApiRequest(
        method = bengwikiapi.get_infobox,
        name = "bengwiki/infobox"
    )

    r.add_param("q")

    return r.call()

@app.route('/wikipedia/define')
def wikipedia_define():
    r = ApiRequest(
        method = wpapi.define,
        name = "wikipedia/define"
    )

    r.add_param("q")
    r.add_param("lang", default = "en")

    return r.call()

@app.route('/wikipedia/suggest')
def wikipedia_suggest():
    r = ApiRequest(
        method = wpapi.suggest,
        name = "wikipedia/suggest"
    )

    r.add_param("q")
    r.add_param("lang", default = "en")

    return r.call()

if __name__ == "__main__":
    app.run(debug=True)