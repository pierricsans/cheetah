
from fe.protos import level_pb2
from exceptions import errors
from collections.abc import Sequence
import random
import copy
import webcolors
from server import move_maker
from typing import Callable, Generator, Optional


def GetRandomColor() -> Generator[str, None, None]:
    colors = set()
    for key in webcolors.CSS3_NAMES_TO_HEX.keys():
        colors.add(key)
    yield colors.pop()


def CheckIndigenousHasMoves(level: level_pb2.Level) -> None:
    if not level.grid.indigenous:
        raise errors.InvalidGridException()
    if len(level.grid.indigenous.trajectory.moves) != level.moves:
        raise errors.InvalidGridException


def HasPosition(person: level_pb2.Person) -> bool:
    return person.HasField('position')


def GetAllPeopleWithPotision(
        grid: level_pb2.Grid) -> Sequence[level_pb2.Person]:
    people = []
    for person in move_maker.GetAllPeople(grid):
        if HasPosition(person):
            people.append(person)
    return people


def GetFilterFunction(move: level_pb2.MoveDirection) -> Callable[[level_pb2.MoveDirection], bool]:

    def func(move_candidate: level_pb2.MoveDirection) -> bool:
        return move_candidate == move

    return func


def GetOffset(size: int, forward_moves: int, backward_moves: int) -> int:
    return random.randrange(backward_moves, size - forward_moves)


def GetInitialPosition(grid, person) -> None:

    person.position.x_offset = GetOffset(
        grid.width,
        len([filter(GetFilterFunction(
            level_pb2.MoveDirection.MOVE_DIRECTION_LEFT), person.trajectory.moves)]),
        len([filter(GetFilterFunction(
            level_pb2.MoveDirection.MOVE_DIRECTION_RIGHT), person.trajectory.moves)]),
    )

    person.position.y_offset = GetOffset(
        grid.height,
        len([filter(GetFilterFunction(
            level_pb2.MoveDirection.MOVE_DIRECTION_DOWN), person.trajectory.moves)]),
        len([filter(GetFilterFunction(
            level_pb2.MoveDirection.MOVE_DIRECTION_UP), person.trajectory.moves)]),
    )


def GenerateRandomMoves(
        person: level_pb2.Person,
        moves_taken: Sequence[level_pb2.Trajectory],
        allowed_moves: Sequence[level_pb2.MoveDirection],
        num_moves: int) -> level_pb2.Trajectory:
    trajectory = person.trajectory
    for _ in range(num_moves):
        trajectory.moves.add(direction=random.choice(allowed_moves))
    if trajectory in moves_taken:
        person.ClearField('trajectory')
        GenerateRandomMoves(person, moves_taken, num_moves)
    return trajectory


def GenerateInitialState(
        level: level_pb2.Level,
        person: level_pb2.Person,
        generate_random_moves: bool):
    person.color = next(GetRandomColor())
    existing_trajectories = []
    for existin_person in move_maker.GetAllPeople(level.grid):
        existing_trajectories.append(existin_person.trajectory)
    # Skip generating random moves if the person already has some.
    if generate_random_moves and not person.trajectory.moves:
        GenerateRandomMoves(person, existing_trajectories, level.allowed_moves, level.moves)
    GetInitialPosition(level.grid, person)


def AddAliens(level: level_pb2.Level) -> None:
    """Generates initial position and moves for aliens.

    Args:
      level: The config where number of aliens and moves
        can be foudn.
      grid: Contains the 
    """
    CheckIndigenousHasMoves(level)
    for _ in range(level.num_aliens):
        alien = level.grid.aliens.add()
        GenerateInitialState(level, alien, generate_random_moves=True)


def GenerateInitialGrid(level: level_pb2.Level,
                        moves: Sequence[level_pb2.MoveDirection]) -> None:
    level.grid.name = level.name
    level.grid.height = level.size
    level.grid.width = level.size
    GenerateInitialState(level, level.grid.indigenous)
    AddAliens(level)
