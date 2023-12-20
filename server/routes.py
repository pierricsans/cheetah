import flask
from frontend.protos import level_pb2
from google.protobuf import json_format
from server import alternate_routes
from server import main 

routes = flask.Blueprint("routes", __name__, url_prefix="/")


@routes.route("/")
def index():
    return main.RenderTable()


@routes.route("/getInitialLevel")
def getInitialLevel():
    return main.GetInitialLevel()


@routes.route("/fillLevel")
def getFilledLevel():
    level = json_format.Parse(flask.request.args.get('level'), level_pb2.Level())
    grid = alternate_routes.Grid(level)
    grid.GenerateInitialGrid()
    return json_format.MessageToJson(level)


@routes.route("style.css")
def getStyle():
    with open('server/style.css', 'r') as f:
        return flask.Response(f.read(), mimetype='text/css')

@routes.route("script.js")
def script():
    with open('frontend/bundle.js', 'r') as f:
        return f.read()



