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
- `gameStatusAtom` — `{ state: "playing" | "check" | "checkmate" | "resigned", color }`.
- `whitePlayerAtom` / `blackPlayerAtom` — the `Player` entered on the setup
  page for each color.
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
  reload, same as `whitePlayerAtom`/`blackPlayerAtom`.

## Validation pipeline (`src/GameLogic/`)

Move legality is split into two layers, each in its own file:

1. **`MoveGenerator.ts`** — pseudo-legal move generation. `getValidMoves`
   returns every square a piece could physically move to, per standard
   chess movement rules (blocking pieces, captures, pawn double-step,
   etc.), **without** considering whether the move would leave the mover's
   own king in check. This is the layer to extend when adding new piece
   movement rules (e.g. en passant). It also exports
   `isPawnPromotion(piece, destination)`, a standalone predicate for
   detecting when a pawn move lands on the opposite back rank — a rule,
   not a move (it doesn't change what squares are legal), so it isn't
   folded into `getValidMoves`. `GamePiece.tsx` calls it right after a
   move commits; see "Pawn promotion" below for what happens next.
   `getKingMoves` folds in castling (`getCastlingMoves`) alongside the
   king's normal one-step moves; see "Castling" below. Despite the name
   of the layer, this file doesn't itself validate anything — it only
   generates candidate moves; `GameLogicValidator.ts` below is where
   actual yes/no validation happens.
2. **`GameLogicValidator.ts`** — the game-rules layer built on top of
   `MoveGenerator`:
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

## Castling (`src/GameLogic/MoveGenerator.ts`, `GamePiece.tsx`)

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
`MoveGenerator.ts` as the one place that mapping is spelled out, and are
used both by `GamePiece.tsx`'s move-commit step (to actually relocate the
rook alongside the king) and by `GameLogicValidator.ts`'s `simulateMove`
(so the check-safety simulation used by `getLegalMoves` reflects the
rook's real post-castling position, not its pre-move one).

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
