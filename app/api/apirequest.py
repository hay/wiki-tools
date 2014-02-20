import json

from flask import request, make_response

class ApiRequest:
    params = []

    def __init__(self, **kwargs):
        self.method = kwargs["method"]
        self.name = kwargs["name"]

    def json_response(self, data):
        resp = make_response(json.dumps(data))
        resp.headers["Access-Control-Allow-Origin"] = "*"
        resp.headers["Content-Type"] = "application/json"
        return resp

    def error(self, msg):
        return self.json_response(
            { "error" : msg }
        )

    def add_param(self, paramName, **kwargs):
        param = {
            "name" : paramName
        }

        if 'default' in kwargs:
            param['default'] = kwargs['default']

        self.params.append( param )

    def call(self):
        calldict = {}

        for param in self.params:
            name = param['name']

            if (name not in request.args) and ('default' not in param):
                return error("required parameter " + param['name'] + " not given")

            if 'default' in param and name not in request.args:
                calldict[name] = param['default']
            else:
                calldict[name] = request.args.get(name)

        req = self.method( calldict )

        if req:
            return self.json_response(req)
        else:
            return self.error(self.name + ": no results available")