# Module that given a
from collections.abc import Sequence
import copy
from typing import Generator
from protos import level_pb2

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

def GetAllPeople(grid: level_pb2.Grid) -> Generator[level_pb2.Person, None, None]:
    for person in grid.aliens:
        yield person
    yield grid.indigenous


def MoveGridToNextState(grid: level_pb2.Grid) -> bool:
    """Updates a grid with position of people to next position.
    
    Args:
      grid: The grid to update.
    
    Returns:
      Whether at least one person has at least one next move.
    """
    has_next_mouvement = False
    for person in GetAllPeople(grid):
        try:
          move = person.trajectory.moves[0].direction
        except KeyError:
            continue
        match move:
            case level_pb2.MoveDirection.MOVE_DIRECTION_UP:
                person.position.y_offset = 1 + person.position.y_offset
            case level_pb2.MoveDirection.MOVE_DIRECTION_DOWN:
                person.position.y_offset -= 1
            case level_pb2.MoveDirection.MOVE_DIRECTION_RIGHT:
                person.position.x_offset += 1
            case level_pb2.MoveDirection.MOVE_DIRECTION_LEFT:
                person.position.x_offset -= 1
            case _:
                raise RuntimeError()
        try:
          next_moves = person.trajectory.moves[1:]
          has_next_mouvement = True
        except KeyError:
          continue
        finally:
          del person.trajectory.moves[:]
        for next_move in next_moves:
            person.trajectory.moves.append(next_move)
    return has_next_mouvement
