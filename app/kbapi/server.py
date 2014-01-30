import api, json
from flask import Flask, request, make_response
app = Flask(__name__)

def json_response(data):
    resp = make_response(json.dumps(data))
    resp.headers["Access-Control-Allow-Origin"] = "*"
    return resp

def error(msg):
    return json_response(
        { "error" : msg }
    )

@app.route('/search')
def search():
    if 'q' in request.args:
        q = request.args.get('q')
        data = api.get_search(q)
        return json_response(data) if data else error("invalid search")
    else:
        return error("no query given")

@app.route('/item')
def item():
    if 'isbn' in request.args:
        isbn = request.args.get('isbn')
        data = api.get_isbn(isbn)
        return json_response(data) if data else error("invalid isbn")
    elif 'ppn' in request.args:
        ppn = request.args.get('ppn')
        data = api.get_ppn(ppn)
        return json_response(data) if data else error("invalid ppn")
    else:
        return error("invalid parameter")

if __name__ == "__main__":
    app.run(debug=True)