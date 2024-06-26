import {
  Game,
  Grid,
  Journey,
  Level,
  Move,
  MoveDirection,
  MoveGrow,
  MoveSpin,
  Person,
  PersonType,
  Trajectory,
} from ".././protos/level_pb.js";

import * as emoji from "../emojis.js";

function getDefaultGrid(): Grid {
  return new Grid({
    indigenous: new Person({
      trajectory: new Trajectory(),
      type: PersonType.INDIGENOUS,
    }),
  });
}

export const GAME: Game = new Game({
  journeys: [
    new Journey({
      number: 1,
      allowedMoves: [
        new Move({ direction: MoveDirection.NORTH }),
        new Move({ direction: MoveDirection.SOUTH }),
        new Move({ direction: MoveDirection.WEST }),
        new Move({ direction: MoveDirection.EAST }),
      ],
      size: 5,
      numMoves: 3,
      numAliens: 3,
      grid: getDefaultGrid(),
      levels: [
        new Level({
          number: 1,
          timePerMoveMs: 460,
        }),
        new Level({
          number: 2,
          timePerMoveMs: 440,
        }),
        new Level({
          number: 3,
          timePerMoveMs: 420,
        }),
        new Level({
          number: 4,
          timePerMoveMs: 400,
        }),
        new Level({
          number: 5,
          timePerMoveMs: 380,
        }),
        new Level({
          number: 6,
          timePerMoveMs: 360,
        }),
        new Level({
          number: 7,
          timePerMoveMs: 340,
        }),
        new Level({
          number: 8,
          timePerMoveMs: 320,
        }),
        new Level({
          number: 9,
          timePerMoveMs: 300,
        }),
      ],
      symbols: [
        emoji.SHORT,
        emoji.BEACH_WITH_UMBRELLA,
        emoji.BIKINI,
        emoji.SUN,
        emoji.SOFT_ICE_CREAM,
        emoji.THONG_SANDAL,
        emoji.DESERT_ISLAND,
        emoji.CORAL,
        emoji.SPIRAL_SHELL,
      ],
      minimumStarNumber: 30,
      nextLevel: 1,
    }),
    new Journey({
      number: 2,
      allowedMoves: [
        new Move({ direction: MoveDirection.NORTH_EAST }),
        new Move({ direction: MoveDirection.NORTH_WEST }),
        new Move({ direction: MoveDirection.SOUTH_EAST }),
        new Move({ direction: MoveDirection.SOUTH_WEST }),
      ],
      size: 5,
      numMoves: 3,
      numAliens: 4,
      grid: getDefaultGrid(),
      levels: [
        new Level({
          number: 1,
          timePerMoveMs: 440,
        }),
        new Level({
          number: 2,
          timePerMoveMs: 420,
        }),
        new Level({
          number: 3,
          timePerMoveMs: 400,
        }),
        new Level({
          number: 4,
          timePerMoveMs: 380,
        }),
        new Level({
          number: 5,
          timePerMoveMs: 360,
        }),
        new Level({
          number: 6,
          timePerMoveMs: 340,
        }),
        new Level({
          number: 7,
          timePerMoveMs: 320,
        }),
        new Level({
          number: 8,
          timePerMoveMs: 300,
        }),
        new Level({
          number: 9,
          timePerMoveMs: 280,
        }),
      ],
      symbols: [
        emoji.CLOUD_WITH_SNOW,
        emoji.SNOWFLAKE,
        emoji.SNOWMAN_WITHOUT_SNOW,
        emoji.ICE_SKATE,
        emoji.SLED,
      ],
      minimumStarNumber: 30,
      nextLevel: 1,
    }),
    new Journey({
      number: 3,
      allowedMoves: [
        new Move({ direction: MoveDirection.NORTH }),
        new Move({ direction: MoveDirection.SOUTH }),
        new Move({ direction: MoveDirection.WEST }),
        new Move({ direction: MoveDirection.EAST }),
        new Move({ direction: MoveDirection.DOUBLE_NORTH }),
        new Move({ direction: MoveDirection.DOUBLE_SOUTH }),
        new Move({ direction: MoveDirection.DOUBLE_WEST }),
        new Move({ direction: MoveDirection.DOUBLE_EAST }),
      ],
      size: 6,
      numMoves: 3,
      numAliens: 5,
      grid: getDefaultGrid(),
      levels: [
        new Level({
          number: 1,
          timePerMoveMs: 420,
        }),
        new Level({
          number: 2,
          timePerMoveMs: 400,
        }),
        new Level({
          number: 3,
          timePerMoveMs: 380,
        }),
        new Level({
          number: 4,
          timePerMoveMs: 360,
        }),
        new Level({
          number: 5,
          timePerMoveMs: 340,
        }),
        new Level({
          number: 6,
          timePerMoveMs: 320,
        }),
        new Level({
          number: 7,
          timePerMoveMs: 300,
        }),
        new Level({
          number: 8,
          timePerMoveMs: 280,
        }),
        new Level({
          number: 9,
          timePerMoveMs: 260,
        }),
      ],
      symbols: [
        emoji.SATELLITE,
        emoji.WAXING_CRESCENT_MOON,
        emoji.ROCKET,
        emoji.FLYING_SAUCER,
        emoji.ALIEN,
        emoji.RINGED_PLANET,
      ],
      minimumStarNumber: 30,
      nextLevel: 1,
    }),
    new Journey({
      number: 4,
      allowedMoves: [
        new Move({
          direction: MoveDirection.NORTH,
          spin: MoveSpin.HALF_CLOCKWISE,
        }),
        new Move({
          direction: MoveDirection.SOUTH,
          spin: MoveSpin.HALF_COUNTER_CLOCKWISE,
        }),
        new Move({
          direction: MoveDirection.EAST,
          spin: MoveSpin.HALF_CLOCKWISE,
        }),
        new Move({
          direction: MoveDirection.WEST,
          spin: MoveSpin.HALF_COUNTER_CLOCKWISE,
        }),
        new Move({
          direction: MoveDirection.SOUTH,
          spin: MoveSpin.HALF_CLOCKWISE,
        }),
        new Move({
          direction: MoveDirection.EAST,
          spin: MoveSpin.HALF_COUNTER_CLOCKWISE,
        }),
        new Move({
          direction: MoveDirection.WEST,
          spin: MoveSpin.HALF_CLOCKWISE,
        }),
        new Move({
          direction: MoveDirection.NORTH,
          spin: MoveSpin.HALF_COUNTER_CLOCKWISE,
        }),
      ],
      size: 5,
      numMoves: 3,
      numAliens: 6,
      grid: getDefaultGrid(),
      levels: [
        new Level({
          number: 1,
          timePerMoveMs: 420,
        }),
        new Level({
          number: 2,
          timePerMoveMs: 400,
        }),
        new Level({
          number: 3,
          timePerMoveMs: 380,
        }),
        new Level({
          number: 4,
          timePerMoveMs: 360,
        }),
        new Level({
          number: 5,
          timePerMoveMs: 340,
        }),
        new Level({
          number: 6,
          timePerMoveMs: 320,
        }),
        new Level({
          number: 7,
          timePerMoveMs: 300,
        }),
        new Level({
          number: 8,
          timePerMoveMs: 280,
        }),
        new Level({
          number: 9,
          timePerMoveMs: 260,
        }),
      ],
      symbols: [
        emoji.CHERRIES,
        emoji.STRAWBERRY,
        emoji.LEMON,
        emoji.PINEAPPLE,
        emoji.WATERMELON,
        emoji.KIWI_FRUIT,
        emoji.BANANA,
        emoji.BLUEBERRIES,
        emoji.LIME,
        emoji.LEMON,
      ],
      minimumStarNumber: 30,
      nextLevel: 1,
    }),
    new Journey({
      number: 5,
      allowedMoves: [
        new Move({
          direction: MoveDirection.NORTH,
          spin: MoveSpin.HALF_CLOCKWISE,
        }),
        new Move({
          direction: MoveDirection.SOUTH,
          spin: MoveSpin.HALF_COUNTER_CLOCKWISE,
        }),
        new Move({
          direction: MoveDirection.EAST,
          spin: MoveSpin.HALF_CLOCKWISE,
        }),
        new Move({
          direction: MoveDirection.WEST,
          spin: MoveSpin.HALF_COUNTER_CLOCKWISE,
        }),
        new Move({
          direction: MoveDirection.SOUTH,
          spin: MoveSpin.HALF_CLOCKWISE,
        }),
        new Move({
          direction: MoveDirection.EAST,
          spin: MoveSpin.HALF_COUNTER_CLOCKWISE,
        }),
        new Move({
          direction: MoveDirection.WEST,
          spin: MoveSpin.HALF_CLOCKWISE,
        }),
        new Move({
          direction: MoveDirection.NORTH,
          spin: MoveSpin.HALF_COUNTER_CLOCKWISE,
        }),
        new Move({
          direction: MoveDirection.DOUBLE_NORTH,
          spin: MoveSpin.HALF_CLOCKWISE,
        }),
        new Move({
          direction: MoveDirection.DOUBLE_SOUTH,
          spin: MoveSpin.HALF_COUNTER_CLOCKWISE,
        }),
        new Move({
          direction: MoveDirection.DOUBLE_EAST,
          spin: MoveSpin.HALF_CLOCKWISE,
        }),
        new Move({
          direction: MoveDirection.DOUBLE_WEST,
          spin: MoveSpin.HALF_COUNTER_CLOCKWISE,
        }),
        new Move({
          direction: MoveDirection.DOUBLE_SOUTH,
          spin: MoveSpin.HALF_CLOCKWISE,
        }),
        new Move({
          direction: MoveDirection.DOUBLE_EAST,
          spin: MoveSpin.HALF_COUNTER_CLOCKWISE,
        }),
        new Move({
          direction: MoveDirection.DOUBLE_WEST,
          spin: MoveSpin.HALF_CLOCKWISE,
        }),
        new Move({
          direction: MoveDirection.DOUBLE_NORTH,
          spin: MoveSpin.HALF_COUNTER_CLOCKWISE,
        }),
      ],
      size: 6,
      numMoves: 3,
      numAliens: 6,
      grid: getDefaultGrid(),
      levels: [
        new Level({
          number: 1,
          timePerMoveMs: 420,
        }),
        new Level({
          number: 2,
          timePerMoveMs: 400,
        }),
        new Level({
          number: 3,
          timePerMoveMs: 380,
        }),
        new Level({
          number: 4,
          timePerMoveMs: 360,
        }),
        new Level({
          number: 5,
          timePerMoveMs: 340,
        }),
        new Level({
          number: 6,
          timePerMoveMs: 320,
        }),
        new Level({
          number: 7,
          timePerMoveMs: 300,
        }),
        new Level({
          number: 8,
          timePerMoveMs: 280,
        }),
        new Level({
          number: 9,
          timePerMoveMs: 260,
        }),
      ],
      symbols: [
        emoji.LOLLIPOP,
        emoji.MOON_CAKE,
        emoji.DOUGHNUT,
        emoji.BIRTHDAY_CAKE,
        emoji.COOKIE,
        emoji.CHOCOLATE_BAR,
      ],
      minimumStarNumber: 30,
      nextLevel: 1,
    }),
    new Journey({
      number: 6,
      allowedMoves: [
        new Move({
          spin: MoveSpin.HALF_CLOCKWISE,
          grow: MoveGrow.NO_GROW,
        }),
        new Move({
          spin: MoveSpin.HALF_CLOCKWISE,
          grow: MoveGrow.SHRINK,
        }),
        new Move({
          spin: MoveSpin.HALF_CLOCKWISE,
          grow: MoveGrow.ENLARGE,
        }),
        new Move({
          spin: MoveSpin.HALF_COUNTER_CLOCKWISE,
          grow: MoveGrow.NO_GROW,
        }),
        new Move({
          spin: MoveSpin.HALF_COUNTER_CLOCKWISE,
          grow: MoveGrow.SHRINK,
        }),
        new Move({
          spin: MoveSpin.HALF_COUNTER_CLOCKWISE,
          grow: MoveGrow.ENLARGE,
        }),
      ],
      size: 5,
      numMoves: 3,
      numAliens: 6,
      grid: getDefaultGrid(),
      levels: [
        new Level({
          number: 1,
          timePerMoveMs: 400,
        }),
        new Level({
          number: 2,
          timePerMoveMs: 380,
        }),
        new Level({
          number: 3,
          timePerMoveMs: 360,
        }),
        new Level({
          number: 4,
          timePerMoveMs: 340,
        }),
        new Level({
          number: 5,
          timePerMoveMs: 320,
        }),
        new Level({
          number: 6,
          timePerMoveMs: 300,
        }),
        new Level({
          number: 7,
          timePerMoveMs: 280,
        }),
        new Level({
          number: 8,
          timePerMoveMs: 260,
        }),
        new Level({
          number: 9,
          timePerMoveMs: 240,
        }),
      ],
      symbols: [
        emoji.HOT_PEPPER,
        emoji.EAR_OF_CORN,
        emoji.POTATO,
        emoji.AVOCADO,
        emoji.CARROT,
        emoji.BEANS,
      ],
      minimumStarNumber: 30,
      nextLevel: 1,
    }),
    new Journey({
      number: 7,
      allowedMoves: [
        new Move({ direction: MoveDirection.NORTH }),
        new Move({ direction: MoveDirection.SOUTH }),
        new Move({ direction: MoveDirection.WEST }),
        new Move({ direction: MoveDirection.EAST }),
      ],
      size: 10,
      numMoves: 4,
      numAliens: 8,
      grid: getDefaultGrid(),
      levels: [
        new Level({
          number: 1,
          timePerMoveMs: 400,
        }),
        new Level({
          number: 2,
          timePerMoveMs: 380,
        }),
        new Level({
          number: 3,
          timePerMoveMs: 360,
        }),
        new Level({
          number: 4,
          timePerMoveMs: 340,
        }),
        new Level({
          number: 5,
          timePerMoveMs: 320,
        }),
        new Level({
          number: 6,
          timePerMoveMs: 300,
        }),
        new Level({
          number: 7,
          timePerMoveMs: 280,
        }),
        new Level({
          number: 8,
          timePerMoveMs: 260,
        }),
        new Level({
          number: 9,
          timePerMoveMs: 240,
        }),
      ],
      symbols: [
        emoji.CORAL,
        emoji.SHORT,
        emoji.BEACH_WITH_UMBRELLA,
        emoji.BIKINI,
        emoji.SUN,
        emoji.SOFT_ICE_CREAM,
        emoji.THONG_SANDAL,
        emoji.DESERT_ISLAND,
        emoji.SPIRAL_SHELL,
      ],
      minimumStarNumber: 40,
      nextLevel: 1,
    }),
  ],
  nextJourney: 1,
});
