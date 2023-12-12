var nextLevel;
 
/**
 * @param {number} levelNumber
 */
function getLevel(levelNumber) {

  nextLevel++;
}

/**
 * Does bloop blip.
 */
function init() {
  nextLevel = 1;
  getLevel(nextLevel);
}
