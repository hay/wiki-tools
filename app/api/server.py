import bengwikiapi, dbpedia_lookup_api, kbapi, json
from flask import Flask, request, make_response
app = Flask(__name__)

def json_response(data):
    resp = make_response(json.dumps(data))
    resp.headers["Access-Control-Allow-Origin"] = "*"
    resp.headers["Content-Type"] = "application/json"
    return resp

def error(msg):
    return json_response(
        { "error" : msg }
    )

@app.route('/kb/search')
def search():
    if 'q' in request.args:
        q = request.args.get('q')
        data = kbapi.get_search(q)
        return json_response(data) if data else error("invalid search")
    else:
        return error("no query given")

@app.route('/kb/item')
def item():
    if 'isbn' in request.args:
        isbn = request.args.get('isbn')
        data = kbapi.get_isbn(isbn)
        return json_response(data) if data else error("invalid isbn")
    elif 'ppn' in request.args:
        ppn = request.args.get('ppn')
        data = kbapi.get_ppn(ppn)
        return json_response(data) if data else error("invalid ppn")
    else:
        return error("invalid parameter")

@app.route('/wikipedia/define')
def define():
    if 'q' in request.args:
        q = request.args.get('q')
        data = dbpedia_lookup_api.define(q)
        return json_response(data) if data else error("no definition available")
    else:
        return error("no query given")

@app.route("/wikipedia/suggest")
def suggest():
    if 'q' in request.args:
        q = request.args.get('q')
        limit = request.args.get('limit') if 'limit' in request.args else None
        data = dbpedia_lookup_api.suggest(q, limit)
        return json_response(data) if data else error("no suggestions available")
    else:
        return error("no query given")

@app.route("/bengwiki/infobox")
def infobox():
    if 'q' in request.args:
        q = request.args.get('q')
        box = bengwikiapi.get_infobox(q)
        return json_response(box) if box else error("no infobox available")
    else :
        return error("no query given")

if __name__ == "__main__":
    app.run(debug=True)