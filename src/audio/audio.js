import C from "../constants";
import UIfx from "uifx";

import mp3_bloop from "./samples/bloop.mp3";
import mp3_boop from "./samples/boop.mp3";
import mp3_boop2 from "./samples/boop2.mp3";
import mp3_check from "./samples/check.mp3";
import mp3_chirp from "./samples/chirp.mp3";
import mp3_clack from "./samples/clack.mp3";
import mp3_dadapling from "./samples/da-da-pling.mp3";
import mp3_fanfare from "./samples/fanfare.mp3";
import mp3_feelsgood from "./samples/feelsgood.mp3";
import mp3_knock from "./samples/knock.mp3";
import mp3_pling from "./samples/pling.mp3";
import mp3_tada from "./samples/tada.mp3";
import mp3_ticktick from "./samples/ticktick.mp3";
import mp3_twerp from "./samples/twerp.mp3";
import mp3_upwardsdings from "./samples/upwardsdings.mp3";
import mp3_welldone from "./samples/welldone.mp3";
import mp3_womp from "./samples/womp.mp3";
import mp3_wow from "./samples/wow.mp3";

const DEFAULT_CONFIG = {
  volume: C.DEFAULT_VOLUME,
  throttleMs: 50,
};

const bloop = new UIfx(mp3_bloop, DEFAULT_CONFIG);
function playBloop(volume) {
  bloop.play(volume);
}

const boop = new UIfx(mp3_boop, DEFAULT_CONFIG);
function playBoop(volume) {
  boop.play(volume);
}

const boop2 = new UIfx(mp3_boop2, DEFAULT_CONFIG);
function playBoop2(volume) {
  boop2.play(volume);
}

const check = new UIfx(mp3_check, DEFAULT_CONFIG);
function playCheck(volume) {
  check.play(volume);
}

const chirp = new UIfx(mp3_chirp, DEFAULT_CONFIG);
function playChirp(volume) {
  chirp.play(volume);
}

const clack = new UIfx(mp3_clack, DEFAULT_CONFIG);
function playClack(volume) {
  clack.play(volume);
}

const dadapling = new UIfx(mp3_dadapling, DEFAULT_CONFIG);
function playDaDaPling(volume) {
  dadapling.play(volume);
}

const fanfare = new UIfx(mp3_fanfare, DEFAULT_CONFIG);
function playFanfare(volume) {
  fanfare.play(volume);
}

const feelsgood = new UIfx(mp3_feelsgood, DEFAULT_CONFIG);
function playFeelsGood(volume) {
  feelsgood.play(volume);
}

const knock = new UIfx(mp3_knock, DEFAULT_CONFIG);
function playKnock(volume) {
  knock.play(volume);
}

const pling = new UIfx(mp3_pling, DEFAULT_CONFIG);
function playPling(volume) {
  pling.play(volume);
}

const tada = new UIfx(mp3_tada, DEFAULT_CONFIG);
function playTada(volume) {
  tada.play(volume);
}

const ticktick = new UIfx(mp3_ticktick, DEFAULT_CONFIG);
function playTickTick(volume) {
  ticktick.play(volume);
}

const twerp = new UIfx(mp3_twerp, DEFAULT_CONFIG);
function playTwerp(volume) {
  twerp.play(volume);
}

const upwardsdings = new UIfx(mp3_upwardsdings, DEFAULT_CONFIG);
function playUpwardsDings(volume) {
  upwardsdings.play(volume);
}

const welldone = new UIfx(mp3_welldone, DEFAULT_CONFIG);
function playWellDone(volume) {
  welldone.play(volume);
}

const womp = new UIfx(mp3_womp, DEFAULT_CONFIG);
function playWomp(volume) {
  womp.play(volume);
}

const wow = new UIfx(mp3_wow, DEFAULT_CONFIG);
function playWow(volume) {
  wow.play(volume);
}

export default {
  playBloop,
  playBoop,
  playBoop2,
  playCheck,
  playChirp,
  playClack,
  playDaDaPling,
  playFanfare,
  playFeelsGood,
  playKnock,
  playPling,
  playTada,
  playTickTick,
  playTwerp,
  playUpwardsDings,
  playWellDone,
  playWomp,
  playWow,
};
