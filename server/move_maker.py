# Module that given a
from collections.abc import Sequence
import copy
from typing import Generator
from protos import grid_pb2
from protos import move_pb2
from protos import person_pb2
from google.protobuf import text_format

STARTING_GRID = """
name: "Winnie"
height: 4
width: 4
aliens {
  id: "Jonathan"
  color: "green"
  position {
    x_offset: 1
    y_offset: 0
  }
  moves {
    direction: MOVE_DIRECTION_UP
  }
  moves {
    direction: MOVE_DIRECTION_RIGHT
  }
}
aliens {
  id: "Gregory"
  color: "red"
  position {
    x_offset: 3
    y_offset: 2
  }
  moves {
    direction: MOVE_DIRECTION_LEFT
  }
  moves {
    direction: MOVE_DIRECTION_DOWN
  }
}
indigenous {
  id: "Percy"
  color: "yellow"
  position {
    x_offset: 0
    y_offset: 2
  }
  moves {
    direction: MOVE_DIRECTION_RIGHT
  }
  moves {
    direction: MOVE_DIRECTION_RIGHT
  }
}
"""

def getAllPeople(grid: grid_pb2.Grid) -> Generator[person_pb2.Person, None, None]:
    for person in grid.aliens:
        yield person
    yield grid.indigenous


def moveGridToNextState(grid: grid_pb2.Grid) -> bool:
    has_next_mouvement = False
    for person in getAllPeople(grid):
        try:
          move = person.moves[0].direction
        except KeyError:
            continue
        match move:
            case move_pb2.MoveDirection.MOVE_DIRECTION_UP:
                person.position.y_offset = 1 + person.position.y_offset
            case move_pb2.MoveDirection.MOVE_DIRECTION_DOWN:
                person.position.y_offset -= 1
            case move_pb2.MoveDirection.MOVE_DIRECTION_RIGHT:
                person.position.x_offset += 1
            case move_pb2.MoveDirection.MOVE_DIRECTION_LEFT:
                person.position.x_offset -= 1
            case _:
                raise RuntimeError()
        try:
          next_moves = person.moves[1:]
          has_next_mouvement = True
        except KeyError:
          continue
        finally:
          del person.moves[:]
        for next_move in next_moves:
            person.moves.append(next_move)
    return has_next_mouvement


def main():
    grid = text_format.Merge(STARTING_GRID, grid_pb2.Grid())
    print(grid)
    while grid.indigenous.moves:
        moveGridToNextState(grid)
        print(grid)


if __name__ == "__main__":
    main()
