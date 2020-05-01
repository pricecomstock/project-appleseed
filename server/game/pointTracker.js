class PointTracker {
  constructor(players, options) {
    // initialize map of playerId to points
    this._pointMap = new Map(
      players.map((player) => {
        return [player.playerId, 0];
      })
    );

    this._currentRoundIndex = 0;
    this._roundPointMultipliers = options.rounds.map(
      (roundOptions) => roundOptions.pointMultiplier
    );
    this._pointsPerPrompt = options.pointsPerPrompt;
    this._pointsForShutout = options.pointsForShutout;
  }

  get currentPointMultiplier() {
    return this._roundPointMultipliers[this._currentRoundIndex];
  }

  nextRound() {
    this._currentRoundIndex++;
  }

  sortedPointPairs() {
    let pairs = [...this._pointMap];
    pairs.sort((a, b) => {
      return b[1] - a[1];
    });
    return pairs;
  }

  distributePoints(votingResults, currentVotingMatchup) {
    // TODO This could probably use a good ol' OO refactor
    let numVotes = Object.keys(votingResults).length;
    let pointsPerVote = this._pointsPerPrompt;
    if (numVotes > 1) {
      pointsPerVote = Math.round(this._pointsPerPrompt / numVotes);
    }
    const voteCountArray = Array(currentVotingMatchup.answers.length).fill(0);
    for (const votingPlayerId in votingResults) {
      const voteIndex = votingResults[votingPlayerId];
      // Count votes for this round
      voteCountArray[voteIndex] += 1;
    }

    // Create object for frontend to display scores
    const pointsArray = voteCountArray.map(
      (ct) => ct * pointsPerVote * this.currentPointMultiplier
    );
    let isShutout = // Only one person has points
      pointsArray.filter((points) => {
        return points > 0;
      }).length == 1;

    let shutoutIndex;
    if (isShutout) {
      shutoutIndex = pointsArray.findIndex((points) => {
        return points > 0;
      });
      // pointsArray[(shutoutIndex += this._pointsForShutout)];
    }

    // Assign points to players
    // const votedForAnswer = currentVotingMatchup.answers[voteIndex];
    // const votedForPlayer = votedForAnswer[0];
    currentVotingMatchup.answers.forEach((answerPair, index) => {
      let playerId = answerPair[0];
      let answerText = answerPair[0];
      let pointsForAnswer = pointsArray[index];
      if (isShutout && index === shutoutIndex) {
        pointsForAnswer += this._pointsForShutout * this.currentPointMultiplier;
      }

      this._pointMap.set(
        playerId,
        this._pointMap.get(playerId) + pointsForAnswer
      );
    });

    const scoringDetails = {
      pointsArray,
      isShutout,
      shutoutIndex,
      shutoutPoints: this._pointsForShutout * this.currentPointMultiplier,
    };

    return scoringDetails;
  }
}

module.exports = PointTracker;
