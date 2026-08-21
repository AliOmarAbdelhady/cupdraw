/**
 * Plain-node test suite for the bracket engine (run: node lib/tournament.test.ts).
 * Covers the "no winner without an opponent" validation + cascade behavior.
 */
import { computeBracket, matchId, sanitizePicks, shuffle, TEAM_COUNT } from "./tournament.ts";

let failures = 0;
function check(name: string, cond: boolean) {
  console.log(`${cond ? "PASS" : "FAIL"}  ${name}`);
  if (!cond) failures++;
}

const teams = Array.from({ length: TEAM_COUNT }, (_, i) => ({ id: `t${i}`, name: `Team ${i + 1}` }));
const seed = teams.map((t) => t.id);

// --- normal flow -----------------------------------------------------------
let picks: Record<string, string> = { [matchId(0, 0)]: "t0" };
let b = computeBracket(seed, picks);
check("R16 winner recorded when both teams drawn", b.rounds[0][0].winner === "t0");
check("winner advances into QF slot", b.rounds[1][0].slots[0] === "t0");
check("QF opponent still empty", b.rounds[1][0].slots[1] === null);

// --- THE VALIDATION: no winner while the opponent is missing ----------------
picks = { ...picks, [matchId(1, 0)]: "t0" }; // try to win the QF with only one team there
b = computeBracket(seed, picks);
check("no winner when the opponent slot is empty", b.rounds[1][0].winner === null);
check("sanitize drops the opponentless pick entirely", sanitizePicks(seed, picks)[matchId(1, 0)] === undefined);
check("nothing leaks to the semis", computeBracket(seed, picks).rounds[2][0].slots[0] === null);

// once both feeders are decided the same match becomes winnable
picks = { ...picks, [matchId(0, 1)]: "t2" };
b = computeBracket(seed, picks);
check("QF slot fills once feeder is decided", b.rounds[1][0].slots[1] === "t2");
b = computeBracket(seed, { ...picks, [matchId(1, 0)]: "t0" });
check("QF winner valid once opponent exists", b.rounds[1][0].winner === "t0");

// --- cascade: undoing an earlier result clears downstream picks -------------
const withoutR16 = { ...picks, [matchId(1, 0)]: "t0" };
delete withoutR16[matchId(0, 0)];
b = computeBracket(seed, withoutR16);
check("undoing R16 winner empties the QF slot", b.rounds[1][0].slots[0] === null);
check("cascade clears the QF winner", b.rounds[1][0].winner === null);
check("sanitize removes the stale QF pick", sanitizePicks(seed, withoutR16)[matchId(1, 0)] === undefined);

// --- the final can never be decided before both semis exist ----------------
b = computeBracket(seed, { [matchId(3, 0)]: "t0" });
check("no champion before the semis are decided", b.champion === null);

// --- full tournament still works end to end --------------------------------
const full: Record<string, string> = {};
const sizes = [8, 4, 2, 1];
for (let r = 0; r < 4; r++) {
  for (let m = 0; m < sizes[r]; m++) {
    full[matchId(r, m)] = r === 0 ? seed[m * 2] : full[matchId(r - 1, m * 2)];
  }
}
b = computeBracket(seed, full);
check("all 15 matches decided", b.rounds.flat().every((m) => m.winner !== null));
check("champion crowned at the end", b.champion === "t0");

// --- shuffle sanity ---------------------------------------------------------
check("shuffle keeps all 16 teams", new Set(shuffle(seed)).size === TEAM_COUNT);

console.log(failures === 0 ? "\nALL TESTS PASSED ✅" : `\n${failures} TEST(S) FAILED ❌`);
process.exit(failures === 0 ? 0 : 1);
