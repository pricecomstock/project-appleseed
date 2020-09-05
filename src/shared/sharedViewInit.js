import C from "../constants";
import audio from "../audio/audio";

const {
  STATE_MACHINE: { STATES },
} = C;

export function sharedInitialState(props) {
  return {
    connected: true,

    currentState: STATES.LOBBY,
    roomCode: props.match.params.code,
    gameOptions: {},
    currentRoundIndex: 0,

    clientTimerCalculatedEndTime: 0,
    msRemaining: 0,
    msTotal: 1000,
    timerIsVisible: false,
    timerIntervalId: null,

    theme: C.DEFAULT_THEME,

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
    if (newGameState.currentState === STATES.PROMPTS) {
      audio.playDaDaPling();
    }
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
    let audioWarningMs = 0; // no warning
    if (this.state.currentState === STATES.PROMPTS) {
      audioWarningMs = 10000;
    }
    this.startTimer(data.msTotal, data.msRemaining, audioWarningMs);
  });

  this.state.socket.on("closedRoom", (data) => {
    this.state.socket.close();
    this.props.history.push("/");
  });

  this.state.socket.on("roomdoesnotexisterror", (data) => {
    this.state.socket.close();
    this.props.history.push("/");
  });
}

function bindableSharedMethodInit() {
  this.clearTimer = () => {
    clearInterval(this.state.timerIntervalId);
  };

  // clearing could probably moved somewhere else
  // It is relying there always being another timer after any timers with audio that will cause a clear
  this.startTimer = (msTotal, msRemaining, audioWarningMs) => {
    this.clearTimer(); // only one timer at a time
    this.setState({
      clientTimerCalculatedEndTime:
        Date.now() + msRemaining - C.TIMER_SAFETY_BUFFER,
      msTotal: msTotal,
      // Safety buffer to err on giving players extra time
      msRemaining: msRemaining - C.TIMER_SAFETY_BUFFER,
      timerIsVisible:
        this.state.currentState === STATES.VOTING ||
        this.state.currentState === STATES.PROMPTS,
    });

    let intervalFn = () => {};
    if (audioWarningMs > 0) {
      let warningHasPlayed = false;

      intervalFn = () => {
        let msRemaining = this.state.clientTimerCalculatedEndTime - Date.now();
        if (!warningHasPlayed && msRemaining < audioWarningMs) {
          console.log(
            "Playing audio warning!",
            warningHasPlayed,
            msRemaining,
            audioWarningMs
          );
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

  this.toggleMute = () => {
    this.setState({ volume: this.state.volume > 0 ? 0 : C.DEFAULT_VOLUME });
  };
}

export function sharedOnMountInit(viewComponent) {
  bindableSocketInitialization.bind(viewComponent)();
  bindableSharedMethodInit.bind(viewComponent)();
}
