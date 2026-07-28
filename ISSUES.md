# Issues

A backlog of known gaps and bugs, each written to be picked up
independently. Unlike [specs/](specs/) (which documents how things work),
this file tracks *what's not done yet*. When an issue is resolved, delete
its entry rather than leaving it marked done — git history is the record
of what was fixed and when.

Each entry: a title, complexity, the area it touches, what's
missing/wrong, and enough context to start without re-deriving it from
scratch. Ordered simplest to most complex, so it doubles as a suggested
pickup order.

We tried migrating one entry to [GitHub Issues](https://github.com/alaspaa/my-little-chess-project/issues)
(issue #1, resolved via #2) but are sticking with this file as the
source of truth for now rather than maintaining two backlogs.

---

## Add a quick glow animation to the active side's pieces

**Complexity:** Small — a CSS class + keyframe animation, keyed off state
that's already read where it'd apply.

**Area:** `src/Chess/GameBoard/GamePiece.tsx`, `src/App.css`

Now that the turn-arrow indicator is gone from `GameFooter.tsx` (the
active player is already clear enough from the highlighted name/color
there), the pieces themselves could use a small one-shot visual cue when
their side's turn begins — a quick glow, not a persistent effect for the
whole turn. `GamePiece.tsx` already reads `currentTurnAtom` internally
(for drag-eligibility checks); rendering could add a class like
`.active-side` when `piece.color === currentTurn`, paired with a CSS
`@keyframes` animation (e.g. a brief `box-shadow`/`filter: drop-shadow`
pulse, non-`infinite` so it plays once and settles). Since all pieces of
the newly-active color pick up the class at the same moment the turn
flips, they'd all glow together — worth checking that feels right rather
than gimmicky before committing to per-piece vs. some other grouping.

---

## Add board coordinate labels (ranks/files)

**Complexity:** Small — a wrapper around the existing board rendering, no
new state.

**Area:** UI (`src/Chess/GameBoard/GameBoard.tsx`, `src/App.css`)

There's no way to see file/rank labels (a-h, 1-8) around the board today
— `GameBoard.tsx` just renders 8 `GameBoardRow`s of 8 `GameSquare`s, with
nothing surrounding them. Needs a wrapper element around the existing
`.gameboard` output that renders column letters (a-h) along one edge and
row numbers (1-8) along another, styled to line up with the 100px
`.gamesquare` grid. Since the board's orientation is fixed — there's no
"play as black, flip the board" feature, and `gameBoard[0]` is always
White's back rank rendered at top (see "Board coordinate system" in
`specs/architecture.md`) — the labels are static text in a fixed
position, not derived from player color or recomputed per game.

---

## Display wins/losses/draws

**Complexity:** Small — read-only rendering of an existing atom.

**Area:** UI (`src/Chess/GameBoard/GameFooter.tsx` or `src/Header/Header.tsx`)

`scoreAtom` (`{player1, player2, draws}`, see "Score tracking" in
`specs/architecture.md`) exists and is already incremented correctly
across rematches, using `player1ColorAtom` so the tally stays correct
even after "Rematch (Swap Sides)" — but nothing renders it yet. Render
its counts somewhere in the persistent chrome (`GameFooter` alongside the
player names, or `Header` if it should survive independent of
`GamePage`) — plain text is enough, no new interaction needed.

---

## Add component rendering tests

**Complexity:** Small-medium — mostly test-infrastructure setup, since the
assertions themselves (did the right elements render) are simple.

**Area:** test config (`vite.config.ts`), new dev dependencies,
`src/**/*.test.tsx` next to each component

Only the logic layer (`src/Chess/GameLogic/*.ts`, `src/Chess/types/GameBoard.ts`) has
tests today — components
(`GamePiece`, `GameBoard`, `StartPage`, etc.) aren't covered at all (see
"Testability" in `specs/code-style.md`), so there's no safety net against
a component silently failing to render or a prop being wired up wrong.
Needs: a DOM test environment for Vitest (e.g. `jsdom`, since the current
`vitest.config`'s `test` block has no `environment` set and runs in plain
Node), `@testing-library/react` for rendering into that DOM, and
`vite.config.ts`'s `test.include` extended to also pick up `*.test.tsx`
(currently only matches `*.test.ts`). Start at the minimum bar of one
smoke test per component asserting it renders its expected elements (e.g.
`GameSquare` renders a piece icon when its square has one, `StartPage`
renders both username inputs and the start button) — the existing
components' reliance on raw DOM mouse events for interaction (also called
out in `specs/code-style.md`) means testing drag-and-drop behavior itself
is a separate, harder problem than this issue's scope.

---

## Fifty-move rule draw is not implemented

**Complexity:** Medium — just a counter (moves since the last pawn move
or capture), reset on the right conditions and checked each turn.

**Area:** game state (`src/state.ts`, `src/Chess/GameLogic/GameLogicValidator.ts`)

A game should be drawn if 50 full moves pass with no pawn move and no
capture. Needs: a new counter in state (e.g. `halfmoveClockAtom`),
incremented after every move and reset to 0 whenever the moved piece is a
`"PAWN"` or the destination square was occupied (a capture) — both already
knowable at the point `GamePiece.tsx` commits a move — then setting
`gameStatusAtom` to the existing `"draw"` end state (added for threefold
repetition; see `gameStatus.draw` in `src/locales/en.json`) once the
counter reaches 100 half-moves. Doesn't need full position history like
threefold repetition — just the running count.

---

## Make the fifty-move rule configurable

**Complexity:** Small — one boolean atom and a settings checkbox, gating
an existing check.

**Area:** state (`src/state.ts`), UI (`src/Modal/SettingsMenu.tsx`)

Depends on "Fifty-move rule draw is not implemented" above landing first
— there's nothing to gate without it. Once it exists, add a
`fiftyMoveRuleEnabledAtom` (default `true`), following the same pattern
as `highlightMovesEnabledAtom`, and a matching checkbox in
`SettingsMenu.tsx`'s modal (same shape as the existing "Highlight legal
moves" toggle). Gate only the *end-state* check — whether the halfmove clock reaching
100 actually sets `gameStatusAtom` to the draw state — not the counter
itself, since tracking it is cheap and there's no reason to stop
counting just because the auto-draw is disabled.

---

## Extend position history to support reviewing a game

**Complexity:** Medium — the pieces needed don't exist yet, but nothing
here is architecturally hard on its own.

**Area:** `src/Chess/GameLogic/Position.ts`, state (`src/state.ts`)

`positionHistoryAtom` (see "Position history" in `specs/architecture.md`)
already has every position of the current game in order, which is most
of what a "step through this game" review feature would need — but a
few things are missing: `serializePosition` only goes board→string,
there's no inverse (`deserializePosition`) to turn a saved entry back
into a `Square[][]` for rendering (piece `id`/`hasMoved` can't be
recovered since they were never encoded, but that's fine for pure
review — only the visual position matters there). Also,
`resetGameAtom` clears `positionHistoryAtom` on rematch (deliberately,
so a new game's threefold-repetition count doesn't inherit the old
game's positions), so reviewing a *previous* rematch would need an
explicit archive step — e.g. copying the array somewhere else - before
that reset fires, since nothing preserves it today. See "Record check/
checkmate info in move history" below for the related question of
per-move annotations (check, checkmate, whose move) that a review UI
would likely also want alongside the raw positions.

---

## Record check/checkmate info in move history, including the checking piece

**Complexity:** Medium-large — needs check detection to report *which*
piece is checking, not just whether the king is in check, plus a shape
change to how history is stored.

**Area:** `src/Chess/GameLogic/GameLogicValidator.ts`, `src/Chess/GameLogic/moves/king.ts`,
state (`src/state.ts`)

`isKingInCheck`/`isSquareAttacked` currently only return a boolean —
by design, since all `isKingInCheck` needs today is yes/no. Annotating
history with "this move gave check" (and by which piece — useful for a
review feature, and matches how real chess notation marks checks) needs
`isSquareAttacked` (or a new function built on the same scan in
`moves/king.ts`) to return the attacking piece(s)' coordinates instead of
just `true`, since more than one piece can deliver check at once
(discovered double check). Since `positionHistoryAtom` is currently a
flat `string[]` (see "Position history" in `specs/architecture.md`),
recording this means growing each entry into a small record (e.g.
`{position: string, checkedBy: BoardCoordinates[] | null}`) instead of a
bare string — `isThreefoldRepetition`'s comparison would need updating to
compare the `position` field specifically rather than the whole entry.
Depends on "Extend position history to support reviewing a game" above
existing first if the goal is showing this in a review UI, though the
detection/recording half could land independently.

---

## Add a signup screen (username + password)

**Complexity:** Medium — new page, form, and state additions following an
existing pattern (`StartPage.tsx`), plus the first outgoing network-request
plumbing in an app that doesn't have any today.

**Area:** new page component (e.g. `src/SignupPage/SignupPage.tsx`),
`src/state.ts` (`Page` type), `src/App.tsx`

**User story:** As a new player, I want to sign up with a username and
password, so that I have an account for future features like a lobby and
chat (see "Plan and design a chat window" below).

No signup flow exists today — `StartPage.tsx` just collects two local
player names for a single in-browser hotseat game, there are no accounts
(see "Stack" in `specs/architecture.md`: no backend, no persistence).
Needs a new page with username + password inputs, following `StartPage`'s
conventions (`useTranslation` for labels/errors, a new value added to the
`Page` union and a matching branch in `App.tsx`). On submit, the outgoing
signup message should be shaped like `{ username, password, configs: null }`
— `configs` is a placeholder for a not-yet-decided settings/config payload
and should stay `null` until that shape exists elsewhere. Since there's no
backend or network layer anywhere in this codebase yet, this issue also
has to introduce the first request-sending plumbing — whether that's a
real endpoint, a mocked/stubbed call, or just a `console.log` of the
payload for now is an open decision to make at implementation time.

---

## Add a login screen (username + password)

**Complexity:** Small-medium — mirrors the signup screen's form and reuses
whatever networking plumbing it introduces.

**Area:** new page component (e.g. `src/LoginPage/LoginPage.tsx`),
`src/state.ts` (`Page` type), `src/App.tsx`

**User story:** As a returning player, I want to log in with my username
and password, so that I can access my existing account instead of
re-entering my details every time.

Depends on "Add a signup screen" above landing first, since it establishes
both the credentials-form pattern and the first outgoing request this app
makes — login should reuse those rather than re-inventing them. Needs
username + password inputs only (no `configs` object — login doesn't
create configuration, it authenticates against existing config), a new
`Page` value, and a branch in `App.tsx` alongside the signup one. Where a
successful login actually leads — into `StartPage`'s existing two-player
local setup, straight into a game, somewhere new — is an open design
question, since today's `currentPageAtom` flow (`"setup" | "game"`) has no
concept of "logged in" at all.

---

## Plan and design a chat window

**Complexity:** Large — this issue is scoped as planning/design, not
implementation; the open questions are bigger than the code would be.

**Area:** design/planning first; likely `src/state.ts`, a new
`src/Chat/` (or `src/Lobby/`) folder, and `GamePage.tsx` layout once
scoped

**User stories:**
- As an online player, I want to see other online players in a lobby/chat
  window and challenge one of them to a game, so that I can find an
  opponent without arranging a match outside the app.
- As a player in an active game, I want a separate messaging window with
  my opponent, so that we can talk during the game without it being mixed
  into the general lobby chat.

No chat feature exists today. The intended direction (confirmed with the
user) is two distinct pieces, not one chat window: a **lobby** where
online players see each other and issue/accept challenges, and a
**per-game** messaging window scoped to just the two opponents once a
game starts. Depends on the signup/login issues above landing first —
none of this makes sense without accounts, and it implies this app moves
from today's local-hotseat-only model (see "Stack" in
`specs/architecture.md`) toward being primarily remote-only, which is a
much bigger shift than chat alone (a real backend, real-time transport,
matchmaking/challenge flow, session handling — none of which exist yet).

Before writing any code, this needs a design pass answering at least:
whether the lobby and per-game chat are one component with two modes or
two separate ones; how a challenge is issued/accepted and what happens to
the lobby view once a game starts; whether per-game messages persist
across a rematch the way `resetGameAtom` resets other per-game state (see
"State" in `specs/architecture.md`); and whether the remote-play shift
this implies (accounts, live opponent presence, network transport) should
be tracked as its own separate issue rather than folded into this one.
Deliverable for this issue is a design writeup (a new `specs/` doc, or
enough detail added here) resolving those questions and breaking the
result into concrete, independently-pickup-able sub-issues — not a chat
window itself.

---

## Add a chess clock

**Complexity:** Large — new atoms, a per-turn ticking mechanism that has
to interact with the existing pause state during a pawn promotion, and a
new game-over reason.

**Area:** state (`src/state.ts`), `src/Chess/GameBoard/GamePiece.tsx`, UI
(`src/Chess/GameBoard/GameFooter.tsx`)

No time control exists — games can go on indefinitely. Needs deciding
between two designs before implementation: a **per-game clock** (each
player gets a fixed total budget, e.g. 10 minutes, counting down only on
their turn — the traditional physical chess-clock model), or a
**per-move clock** (each player gets a fixed amount of time to make each
individual move, resetting every turn instead of accumulating a budget).
Either needs: a remaining-time atom per color, a ticking mechanism (e.g.
`setInterval` started/stopped on `currentTurnAtom` changes), a new
`gameStatusAtom` end state (e.g. `"timeout"`) set when a color's time
expires, and a `gameStatus.timeout` translation key rendered the same way
`GameFooter.tsx`'s `getGameStatusMessage` already handles the other end
states. Also needs to not tick while `pendingPromotionAtom` is set, since
the game is already effectively paused then (see "Pawn promotion" in
`specs/architecture.md`) — the same pause condition `GamePiece.tsx`'s
`onPointerDown` already checks before starting a drag.

