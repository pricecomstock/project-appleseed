class PointTracker {
  constructor(players, options) {
    // initialize map of playerId to points
    this._pointMap = new Map(
      players.map((player) => {
        return [player.playerId, 0];
      })
    );

    this._pointsPerPrompt = options.pointsPerPrompt;
    this._pointsForShutout = options.pointsForShutout;
  }

  sortedPointPairs() {
    let pairs = [...this._pointMap];
    pairs.sort((a, b) => {
      return a[1] - b[1];
    });
    return pairs;
  }

  distributePoints() {
    // TODO Take map or pairs and divide up points accordingly into the map in this object
  }
}
