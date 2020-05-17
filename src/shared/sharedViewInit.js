import C from "../constants";

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
    this.startTimer(data.msTotal, data.msRemaining);
  });
}

function bindableSharedMethodInit() {
  this.startTimer = (msTotal, msRemaining) => {
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

    this.setState({
      timerIntervalId: setInterval(() => {
        this.setState({
          msRemaining: this.state.clientTimerCalculatedEndTime - Date.now(),
        });
      }, C.TIMER_COUNTDOWN_INTERVAL),
    });
  };
}

export function sharedOnMountInit(viewComponent) {
  bindableSocketInitialization.bind(viewComponent)();
  bindableSharedMethodInit.bind(viewComponent)();
}
