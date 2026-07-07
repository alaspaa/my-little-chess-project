# Architecture

## Stack

React 19 + TypeScript + Vite, Jotai for state, FontAwesome for piece icons.
No backend, no router, no persistence — everything lives in memory for the
duration of one browser tab.

## Page switching

There's no routing library. `currentPageAtom` (`"setup" | "game"`) in
`src/state.ts` picks which top-level component `App.tsx` renders:
`StartPage` or `GamePage`. Adding a new page means adding a new value to
`Page` and a new branch in `App.tsx`, not a new route. `App.tsx` also
always renders `Header` above whichever page is active — it's the one
piece of UI shared by every page (the game title today; a natural home
for future global controls like a settings toggle or language
selector).

`GamePage.tsx` is the page-level container for an in-progress game — it
reads the atoms that only exist to hand down to children
(`whitePlayerAtom`/`blackPlayerAtom`/`currentTurnAtom`/`gameStatusAtom`)
and renders `GameBoard` plus `GameFooter`. `GameBoard.tsx` itself is just
the 8x8 grid (reads only `gameBoardAtom`, plus the drag-follow
`pieceClicked`/`boardCoordinates` state described below) — it doesn't
know about players, turns, or game status. When something is page-level
concern rather than board-drawing concern, it belongs in `GamePage`, not
`GameBoard`.

## State (`src/state.ts`)

All cross-component state is a Jotai atom in this one file:

- `gameBoardAtom` — the `Square[][]` board, source of truth for piece
  positions.
- `pieceClickedAtom` / `boardCoordinatesAtom` — transient drag state (which
  piece id is being dragged, and the live cursor position).
- `validMovesAtom` — the legal destination squares for whatever piece is
  currently picked up; consumed by `GameSquare` to render the highlight.
- `currentTurnAtom` — whose color may move next.
- `gameStatusAtom` — `{ state: "playing" | "check" | "checkmate" | "resigned" | "draw", color }`.
  `color` is `null` for `"draw"` — a draw has no winner to point to.
- `player1Atom` / `player2Atom` — the `Player` entered on the setup page
  for each slot. Identity is tracked by slot, not color, so either player
  can play either color (`StartPage.tsx` asks for "Player 1"/"Player 2"
  usernames, not "White"/"Black"). `player1ColorAtom` (`CHESS_PIECE_COLOR`,
  default `"white"`) says which color `player1Atom` currently plays;
  `player2Atom` always plays the other. `whitePlayerAtom`/`blackPlayerAtom`
  are derived read-only atoms computed from these three, kept around for
  call sites that need "whoever is playing white/black right now" (e.g.
  `GameFooter` laying out board columns) without needing to know about
  slots at all.
- `capturedPiecesAtom` — keyed by the *capturing* color (e.g. `.white` is
  the black pieces white has taken), rendered in `GameFooter`.
- `pendingPromotionAtom` — `{ color, coordinates } | null`, set when a
  pawn move lands on the back rank; see "Pawn promotion" below.
- `languageAtom` — mirrors `i18n.language`, initialized from it directly
  (`src/i18n.ts`'s `i18n` instance is imported into `state.ts` for this).
  `SettingsMenu.tsx`'s language dropdown (`src/Modal/languages.ts` holds
  the `{code, label, flag}` list) sets both this atom and calls
  `i18n.changeLanguage(code)` together — the atom exists purely so React
  re-renders on a language change via Jotai's subscription instead of
  hooking into `i18next`'s own event emitter. Not persisted across a
  reload, same as `player1Atom`/`player2Atom`.
- `positionHistoryAtom` — a serialized snapshot appended after every
  completed move; see "Position history" below.
- `threefoldRepetitionEnabledAtom` — default `true`, a settings toggle
  (`SettingsMenu.tsx`) gating whether reaching three occurrences of a
  position actually ends the game; see "Position history" below.
- `resetGameAtom` — write-only action atom (no read value) that puts
  every per-game atom (`gameBoardAtom`, `currentTurnAtom`,
  `gameStatusAtom`, `capturedPiecesAtom`, `positionHistoryAtom`,
  `pendingPromotionAtom`, and the transient drag atoms) back to its
  starting value; see "Rematch" below. Deliberately leaves
  `player1Atom`/`player2Atom`/`player1ColorAtom` and settings atoms
  (`highlightMovesEnabledAtom`, `languageAtom`) untouched — a rematch is
  the same two players (and colors, until switching sides is supported)
  playing again, not a return to the setup page.
- `scoreAtom` — `{ player1: number, player2: number, draws: number }`,
  tallying results across rematches; see "Score tracking" below. Keyed by
  player slot, not color, and deliberately not reset by `resetGameAtom`.

## Validation pipeline (`src/GameLogic/`)

Move legality is split into two layers, each in its own file:

1. **`MoveResolver.ts`** — pseudo-legal move generation. `getValidMoves`
   returns every square a piece could physically move to, per standard
   chess movement rules (blocking pieces, captures, pawn double-step,
   etc.), **without** considering whether the move would leave the mover's
   own king in check. Despite the name of the layer, this file doesn't
   itself validate anything — it only generates candidate moves;
   `GameLogicValidator.ts` below is where actual yes/no validation
   happens. `MoveResolver.ts` itself is just a thin dispatcher: each
   piece type's actual move rules live in their own file under
   `src/GameLogic/moves/` (`pawn.ts`, `rook.ts`, `knight.ts`, `bishop.ts`,
   `queen.ts`, `king.ts`), with shared geometry helpers (`isOnBoard`,
   `squareIsEmpty`, `isOpponentPiece`, `getSlidingMoves`,
   `ROOK_DIRECTIONS`/`BISHOP_DIRECTIONS`) factored into `moves/shared.ts`.
   This is the layer to extend when adding new piece movement rules (e.g.
   en passant, in `moves/pawn.ts`). `moves/pawn.ts` also exports
   `isPawnPromotion(piece, destination)`, a standalone predicate for
   detecting when a pawn move lands on the opposite back rank — a rule,
   not a move (it doesn't change what squares are legal), so it isn't
   folded into `getPawnMoves`. `GamePiece.tsx` calls it right after a
   move commits; see "Pawn promotion" below for what happens next.
   `moves/king.ts`'s `getKingMoves` folds in castling (`getCastlingMoves`)
   alongside the king's normal one-step moves; see "Castling" below. Note
   `moves/king.ts` imports `getValidMoves` back from `MoveResolver.ts`
   (for `isSquareAttacked`'s non-king attacker case) while
   `MoveResolver.ts` imports `getKingMoves` from `moves/king.ts` — a
   deliberate circular import that works because both sides only call
   into the other from inside a function body, never at module-load time.
   `MoveResolver.ts` re-exports everything `moves/*.ts` needs to expose
   externally (`isPawnPromotion`, `isSquareAttacked`, `isCastlingMove`,
   `getCastlingRookMove`), so nothing outside `src/GameLogic/` needs to
   know about the `moves/` folder at all.
2. **`GameLogicValidator.ts`** — the game-rules layer built on top of
   `MoveResolver`:
   - `getLegalMoves` filters `getValidMoves`' output down to moves that
     don't leave the mover's own king in check (simulates the move on a
     cloned board and checks `isKingInCheck`).
   - `isKingInCheck` / `isCheckmate` — check and checkmate detection.
   - `validateMove` — the boolean yes/no check used to validate a drag-drop
     attempt, built from `getLegalMoves`.

  `GamePiece.tsx` uses `getLegalMoves` for highlighting (so the UI only
  ever shows truly legal squares) and `validateMove` to decide whether to
  commit a drop.

En passant is not implemented. It would need move history state (which
pawn just double-stepped) that doesn't exist yet — add it as a new
atom/field rather than inferring it from the board alone.

## Turn flow (`GamePiece.tsx`)

1. `mousedown` on a piece: look up its board coordinates
   (`findPieceCoordinates`), refuse to start a drag if it's not that
   piece's color's turn (`currentTurnAtom`), the game already ended
   (`isGameOver(gameStatusAtom.state)`), or a promotion choice is pending
   (`pendingPromotionAtom`) — otherwise populate `validMovesAtom` via
   `getLegalMoves`.
2. `mousemove` (in `GameBoard.tsx`, not `GamePiece.tsx`): follows the cursor
   by directly setting the dragged piece's inline `style.top`/`left` —
   this is imperative DOM manipulation, not React state, for drag
   smoothness.
3. `mouseup`: resolve the square under the cursor, call
   `updateGameBoardWithMovedPiece`, which internally calls `validateMove`.
   Success is detected by **reference equality** — the update functions
   return the original `gameBoard` object unchanged when a move is
   rejected, so `newBoard !== gameBoard` means the move was applied. On
   success: commit the new board and captured-piece bookkeeping, then
   either set `pendingPromotionAtom` (if `isPawnPromotion` is true for the
   piece that just landed) or flip `currentTurnAtom` and recompute
   `gameStatusAtom` immediately — not both. See "Pawn promotion" below for
   how the deferred case gets finished.

## Pawn promotion (`src/Modal/PromotionPrompt.tsx`)

When `GamePiece.tsx` detects a promotion, it does **not** flip the turn or
recompute check/checkmate status right away — it sets `pendingPromotionAtom`
to `{ color, coordinates }` and leaves the pawn sitting on the back rank.
While that atom is non-null, `GamePiece.tsx`'s `mousedown` handler refuses
to start any drag (for either color), so the game is effectively paused.

`PromotionPrompt` (rendered from `GamePage.tsx`, a sibling of `GameBoard`/
`GameFooter`) watches `pendingPromotionAtom` and renders `ModalFrame` with
a row of piece choices when it's set. Choosing a piece:

1. Replaces the pawn at `pendingPromotion.coordinates` with `{...pawn,
   type: chosenType}` (same `id`, so nothing else needs to know a
   replacement happened — ids aren't parsed for piece type anywhere).
2. Flips `currentTurnAtom` and recomputes `gameStatusAtom` — the same
   two steps `GamePiece.tsx` would have done immediately, just deferred
   until now, since checkmate/check must be evaluated against the
   *promoted* piece, not the pawn.
3. Clears `pendingPromotionAtom`, un-pausing the game.

This duplicates a small (~6 line) turn-flip/status snippet between
`GamePiece.tsx` and `PromotionPrompt.tsx` rather than sharing a helper —
deliberate, since the two files don't have a natural common parent to
own that logic, and the snippet is small enough that the duplication is
cheaper than the plumbing to share it.

## Castling (`src/GameLogic/moves/king.ts`, `GamePiece.tsx`)

`getKingMoves` appends castling destinations (`{x: 6}` kingside, `{x: 2}`
queenside, same `y`) via `getCastlingMoves`, which requires: the king and
the relevant corner `ROOK` both have `hasMoved === false`, the squares
between them are empty, and the king isn't currently in check, doesn't
pass through, and doesn't land on a square attacked by the opponent.
That last check reuses `isSquareAttacked(gameBoard, coordinates, byColor)`
— a generalization of "is this square attacked" that `isKingInCheck` in
`GameLogicValidator.ts` is also built on now (it used to duplicate this
scan inline). `isSquareAttacked` deliberately treats a king's *own*
castling squares as not-an-attack, using only its plain one-step moves —
otherwise checking whether white's castling path is safe could require
computing black's castling eligibility, which could require checking
white's again, recursing forever.

Castling moves two pieces (king + rook) atomically, which the rest of the
move pipeline doesn't otherwise support (`updateGameBoardWithMovedPiece`
only relocates one piece per move) — `isCastlingMove(piece, from, to)`
(true when a king moves two squares) and `getCastlingRookMove(kingDestX)`
(mapping the king's landing file to the rook's `{from, to}` files) live in
`moves/king.ts` (re-exported from `MoveResolver.ts`) as the one place
that mapping is spelled out, and are
used both by `GamePiece.tsx`'s move-commit step (to actually relocate the
rook alongside the king) and by `GameLogicValidator.ts`'s `simulateMove`
(so the check-safety simulation used by `getLegalMoves` reflects the
rook's real post-castling position, not its pre-move one).

## Position history (`src/GameLogic/Position.ts`)

`serializePosition(gameBoard, turn)` turns a board + side-to-move into a
plain string key — `Square[][]` objects are always structurally distinct
even when the arrangement is identical, so there's no other way to compare
"is this the same position as before". It only encodes color, piece type,
and square (via `PAWN`/`ROOK`/etc. mapped to single letters, `N` for
knight to avoid colliding with `K` for king) plus whose turn it is —
deliberately not `hasMoved` or piece `id`, and not castling/en passant
rights — two positions that only differ in those rights are (for now)
treated as the same position, a reasonable simplification per the note
in `Position.ts` until it actually causes an incorrect draw in practice.

`GamePiece.tsx`'s move-commit step appends `serializePosition(...)` to
`positionHistoryAtom` right after flipping the turn, and
`PromotionPrompt.tsx` does the same once a promotion choice resolves —
mirroring the same duplication-over-shared-helper tradeoff described in
"Pawn promotion" above. Deliberately *not* appended while a promotion is
still pending (`GamePiece.tsx`'s promotion branch skips it): the pawn
sitting on the back rank with the turn not yet flipped isn't a real
position reached in the game, just an intermediate UI state.

`isThreefoldRepetition(positionHistory, position)` in
`GameLogicValidator.ts` is the consumer: a plain count of how many times
`position` appears in `positionHistory`, true once it's 3 or more. Both
`GamePiece.tsx` and `PromotionPrompt.tsx` call it right after appending
the new position, gated by `threefoldRepetitionEnabledAtom` (default
`true`) — only when both are true does it set `gameStatusAtom` to
`{state: "draw", color: null}` — checked after checkmate (checkmate wins
if a move somehow satisfies both) but before an ordinary check, since a
draw ends the game regardless of whether the final position also happens
to check the mover's opponent. `positionHistoryAtom` itself is always
appended to regardless of the toggle — only the draw-triggering check is
gated, since tracking is cheap and there's no reason to stop counting
just because the auto-draw is disabled.

## Rematch (`src/Modal/RematchPrompt.tsx`)

`RematchPrompt` watches `gameStatusAtom` via `isGameOver` and renders a
non-dismissible `ModalFrame` (same choice as `PromotionPrompt` — the
underlying `game-footer-status` bar already shows the specific outcome,
e.g. "Bob wins by resignation", so this modal doesn't repeat it) with two
buttons: "Rematch" calls `resetGameAtom` alone, and "Rematch (Swap Sides)"
calls it too but also flips `player1ColorAtom` — the only state that
needs to change, since player identity is already tracked independent of
color (see the "State" section above). Rendered from `GamePage.tsx` as
another sibling of `GameBoard`/`GameFooter`, same as `PromotionPrompt`.

## Score tracking (`GamePage.tsx`)

`gameStatusAtom` is set to an end state from four different call sites
(`GamePiece.tsx`, `PromotionPrompt.tsx`, and `GameFooter.tsx`'s
resign/draw-offer handlers), so rather than duplicate "did the game just
end" logic in all four, `GamePage.tsx` has a single `useEffect` that
watches `gameStatusAtom` and increments `scoreAtom` once per transition
into an end state (tracked via a `wasGameOverRef`, so a rematch resetting
`gameStatusAtom` back to `"playing"` doesn't itself count as a result,
and re-renders while already game-over don't double-count). For
checkmate/resigned, `gameStatus.color` is the *loser's* color (same
convention `GameFooter.tsx`'s `getWinnerName` already relies on), so the
winner is the opposite color, compared against `player1ColorAtom` to
decide whether `player1` or `player2` gets credited — this stays correct
even if sides are swapped between games, since it reads the actual
current color assignment rather than assuming `player1` is always White.

## User-facing text (`src/i18n.ts`, `src/locales/`)

Every piece of visible text goes through `react-i18next`'s `useTranslation`
hook (`const { t } = useTranslation()`), never a literal string in JSX.
`src/i18n.ts` initializes the `i18next` instance with a single locale for
now (`src/locales/en.json`), keyed by section (`common`, `startPage`,
`gameStatus`). Strings that splice in a value (e.g. the check/checkmate
messages) use `i18next`'s `{{placeholder}}` interpolation
(`t('gameStatus.checkmate', {winner: name})`) rather than JS template
literals, so a translation can reorder the sentence around the
placeholder. `getPlayerName` in `GameFooter.tsx` takes `t` as a parameter
rather than calling the hook itself, since it's a plain module-level
function, not a component — keeps it testable the same way the rest of
the logic layer is (see `specs/code-style.md`).

## Board coordinate system

`Square[][]` is indexed `[y][x]`. `gameBoard[0]` is White's back rank
(rendered at the top of the page) and `gameBoard[7]` is Black's back rank
(rendered at the bottom) — this is a fixed, non-flippable orientation;
there's no "play as black, flip the board" feature.

Squares also have a 1-indexed DOM id used for hit-testing drops:
`getSquareNumber(x, y) = (x + 1) + (y * 8)`, defined in both
`GameSquare.tsx` (rendering) and `GamePiece.tsx` (`getBoardCoordinates`,
the inverse). If one changes, the other must change with it.

## Responsive layout (`src/App.css`)

The board's sizing is driven by two CSS custom properties defined on
`:root`: `--board-size` (`min(800px, calc(100vw - 2rem))`) and
`--square-size` (`calc(var(--board-size) / 8)`). `.gameboard`,
`.gameboardrow`, and `.game-footer` all use `var(--board-size)` directly;
`.gamesquare` and `.promotion-choice-button` use `var(--square-size)`;
and `.chesspiece` derives its size and padding as fractions of
`--square-size` (`0.6`/`0.2`/`0.2`, matching the original fixed
60px/20px/20px on a 100px square) so pieces scale in proportion to the
squares instead of independently. This keeps every size relationship
defined once, rather than needing a second set of hardcoded pixel values
at a breakpoint. `elementsFromPoint`-based drop hit-testing in
`GamePiece.tsx` and `getLegalMoves` highlighting are unaffected by any of
this, since they work in screen coordinates, not fixed pixel assumptions
about square size — only the drag-follow offset in `GameBoard.tsx`
(`clientX - 30`, `clientY - 40`) is a hardcoded pixel value tuned for the
default piece size, and will look slightly off (not broken, just
visually offset from the cursor) at a scaled-down size.
