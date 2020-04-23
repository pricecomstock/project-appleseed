// Early checking can deal with drift when under load!
// But mostly this class is just an abstraction from having to work
// Directly with Date.now()
const EARLY_CHECKING_OFFSET_MS = 1000;
const RECHECK_INTERVAL = 1000;

class Timer {
  constructor(seconds, onCompleteFunction) {
    this.ms = seconds * 1000;
    this.startTime = Date.now();
    this.endTime = this.startTime + this.ms;

    this._onComplete = onCompleteFunction;

    this._checkTimeoutId = null;

    this.setCheckTimeout(this.ms - EARLY_CHECKING_OFFSET_MS);
  }

  setCheckTimeout(ms) {
    this._checkTimeoutId = setTimeout(() => {
      this.checkTimer();
    }, ms);
  }

  checkTimer() {
    if (Date.now() > this.endTime) {
      this._onComplete();
    } else {
      this.setCheckTimeout(RECHECK_INTERVAL);
    }
  }

  get msRemaining() {
    return this.endTime - Date.now();
  }

  cancel() {
    clearTimeout(this._checkTimeoutId);
  }
}

test = () => {
  let timer = new Timer(5, () => console.log("Test Done!"));
};
// test();

module.exports = Timer;
