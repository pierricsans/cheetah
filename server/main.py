
from frontend.protos import level_pb2
from google.protobuf import json_format
from google.protobuf import text_format
from server import routes
from server import move_maker
from server import alternate_routes
import jinja2
import flask



DUMMY_LEVEL = """
size: 5
rank: 0
moves: 4
num_aliens: 5
allowed_moves {
  direction: MOVE_DIRECTION_UP
}
allowed_moves {
  direction: MOVE_DIRECTION_DOWN
}
allowed_moves {
  direction: MOVE_DIRECTION_LEFT
}
allowed_moves {
  direction: MOVE_DIRECTION_RIGHT
}
grid {
  indigenous {
    trajectory {
    }
    type: PERSON_TYPE_INDIGENOUS
  }
}
"""

MOVES = [
  level_pb2.MoveDirection.MOVE_DIRECTION_RIGHT,
  level_pb2.MoveDirection.MOVE_DIRECTION_DOWN,
  level_pb2.MoveDirection.MOVE_DIRECTION_RIGHT,
]

def RenderTable() -> str:
   env = jinja2.Environment(
    loader=jinja2.PackageLoader("server"),
    autoescape=jinja2.select_autoescape()
   )
   template = env.get_template("table.html")
   level = text_format.Merge(DUMMY_LEVEL, level_pb2.Level())
   return template.render(level=level)


def GetInitialLevel() -> level_pb2.Level:
   level = text_format.Merge(DUMMY_LEVEL, level_pb2.Level())
   return json_format.MessageToJson(level)
   

def create_app(config_filename="server.conf.BaseConfig"):
    app = flask.Flask(__name__)
    app.config.from_object(config_filename)
    app.register_blueprint(routes.routes)
    return app


def main(argv):
  del argv  # Unused.
  level = text_format.Merge(DUMMY_LEVEL, level_pb2.Level())
  moves = [
     level_pb2.MoveDirection.MOVE_DIRECTION_LEFT,
     level_pb2.MoveDirection.MOVE_DIRECTION_RIGHT,
     level_pb2.MoveDirection.MOVE_DIRECTION_DOWN
  ]
