import C from "../constants";
import audio from "../audio/audio";

export function sharedInitialState(props) {
  return {
    connected: true,

    currentState: "lobby",
    roomCode: props.match.params.code,
    gameOptions: {},
    currentRoundIndex: 0,

    clientTimerCalculatedEndTime: 0,
    msRemaining: 0,
    msTotal: 1000,
    timerIsVisible: false,
    timerIntervalId: null,

    theme: {
      backgroundStyles: {
        backgroundColor: "#777",
        color: "#666",
      },
      textColor: "white",
      backgroundClasses: "pattern-diagonal-stripes-xl",
    },

    volume: C.DEFAULT_VOLUME,
  };
}

function bindableSocketInitialization() {
  this.state.socket.on("connection", () => {
    console.log("Connected");
    this.setState({ connected: true });
  });

  this.state.socket.on("state", (newGameState) => {
    console.log("Game state updated", newGameState);
    this.setState({ currentState: newGameState.currentState });
  });

  this.state.socket.on("gameoptions", (data) => {
    this.setState({
      gameOptions: data.options,
      currentRoundIndex: data.currentRoundIndex,
    });
  });

  this.state.socket.on("disconnect", () => {
    this.setState({ connected: false });
  });

  this.state.socket.on("reconnect", () => {
    this.setState({ connected: true });
  });

  this.state.socket.on("theme", (theme) => {
    this.setState({ theme });
  });

  this.state.socket.on("timer", (data) => {
    const audioWarningEnabled = this.state.currentState === "prompts";
    console.log("starting timer with warning", audioWarningEnabled);
    this.startTimer(data.msTotal, data.msRemaining, audioWarningEnabled);
  });
}

function bindableSharedMethodInit() {
  this.startTimer = (msTotal, msRemaining, audioWarning) => {
    this.setState({
      clientTimerCalculatedEndTime:
        Date.now() + msRemaining - C.TIMER_SAFETY_BUFFER,
      msTotal: msTotal,
      // Safety buffer to err on giving players extra time
      msRemaining: msRemaining - C.TIMER_SAFETY_BUFFER,
      timerIsVisible:
        this.state.currentState === "voting" ||
        this.state.currentState === "prompts",
    });

    let intervalFn = () => {};

    if (audioWarning) {
      const WARNING_THRESHOLD_MS = 10000;
      let warningHasPlayed = false;

      intervalFn = () => {
        let msRemaining = this.state.clientTimerCalculatedEndTime - Date.now();
        if (!warningHasPlayed && msRemaining < WARNING_THRESHOLD_MS) {
          warningHasPlayed = true;
          audio.playTickTick(this.state.volume);
        }
        this.setState({
          msRemaining: msRemaining,
        });
      };
    } else {
      intervalFn = () => {
        this.setState({
          msRemaining: this.state.clientTimerCalculatedEndTime - Date.now(),
        });
      };
    }
    this.setState({
      timerIntervalId: setInterval(intervalFn, C.TIMER_COUNTDOWN_INTERVAL),
    });
  };

  this.clearTimer = () => {
    clearInterval(this.state.timerIntervalId);
  };

  this.toggleMute = () => {
    this.setState({ volume: this.state.volume > 0 ? 0 : C.DEFAULT_VOLUME });
  };
}

export function sharedOnMountInit(viewComponent) {
  bindableSocketInitialization.bind(viewComponent)();
  bindableSharedMethodInit.bind(viewComponent)();
}
