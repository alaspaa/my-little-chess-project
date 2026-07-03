# Architecture

## Stack

React 19 + TypeScript + Vite, Jotai for state, FontAwesome for piece icons.
No backend, no router, no persistence — everything lives in memory for the
duration of one browser tab.

## Page switching

There's no routing library. `currentPageAtom` (`"setup" | "game"`) in
`src/state.ts` picks which top-level component `App.tsx` renders. Adding a
new page means adding a new value to `Page` and a new branch in `App.tsx`,
not a new route.

## State (`src/state.ts`)

All cross-component state is a Jotai atom in this one file:

- `gameBoardAtom` — the `Square[][]` board, source of truth for piece
  positions.
- `pieceClickedAtom` / `boardCoordinatesAtom` — transient drag state (which
  piece id is being dragged, and the live cursor position).
- `validMovesAtom` — the legal destination squares for whatever piece is
  currently picked up; consumed by `GameSquare` to render the highlight.
- `currentTurnAtom` — whose color may move next.
- `gameStatusAtom` — `{ state: "playing" | "check" | "checkmate", color }`.
- `whitePlayerAtom` / `blackPlayerAtom` — the `Player` entered on the setup
  page for each color.

## Validation pipeline (`src/types/`)

Move legality is split into two layers, each in its own file:

1. **`MoveValidator.ts`** — pseudo-legal move generation. `getValidMoves`
   returns every square a piece could physically move to, per standard
   chess movement rules (blocking pieces, captures, pawn double-step,
   etc.), **without** considering whether the move would leave the mover's
   own king in check. This is the layer to extend when adding new piece
   movement rules (e.g. castling, en passant).
2. **`GameLogicValidator.ts`** — the game-rules layer built on top of
   `MoveValidator`:
   - `getLegalMoves` filters `getValidMoves`' output down to moves that
     don't leave the mover's own king in check (simulates the move on a
     cloned board and checks `isKingInCheck`).
   - `isKingInCheck` / `isCheckmate` — check and checkmate detection.
   - `validateMove` — the boolean yes/no check used to validate a drag-drop
     attempt, built from `getLegalMoves`.

  `GamePiece.tsx` uses `getLegalMoves` for highlighting (so the UI only
  ever shows truly legal squares) and `validateMove` to decide whether to
  commit a drop.

En passant and castling are not implemented. En passant would need move
history state (which pawn just double-stepped) that doesn't exist yet —
add it as a new atom/field rather than inferring it from the board alone.

## Turn flow (`GamePiece.tsx`)

1. `mousedown` on a piece: look up its board coordinates
   (`findPieceCoordinates`), refuse to start a drag if it's not that
   piece's color's turn (`currentTurnAtom`) or if the game already ended
   (`gameStatusAtom.state === "checkmate"`), otherwise populate
   `validMovesAtom` via `getLegalMoves`.
2. `mousemove` (in `GameBoard.tsx`, not `GamePiece.tsx`): follows the cursor
   by directly setting the dragged piece's inline `style.top`/`left` —
   this is imperative DOM manipulation, not React state, for drag
   smoothness.
3. `mouseup`: resolve the square under the cursor, call
   `updateGameBoardWithMovedPiece`, which internally calls `validateMove`.
   Success is detected by **reference equality** — the update functions
   return the original `gameBoard` object unchanged when a move is
   rejected, so `newBoard !== gameBoard` means the move was applied. On
   success: commit the new board, flip `currentTurnAtom`, then recompute
   `gameStatusAtom` for the side about to move next.

## Board coordinate system

`Square[][]` is indexed `[y][x]`. `gameBoard[0]` is White's back rank
(rendered at the top of the page) and `gameBoard[7]` is Black's back rank
(rendered at the bottom) — this is a fixed, non-flippable orientation;
there's no "play as black, flip the board" feature.

Squares also have a 1-indexed DOM id used for hit-testing drops:
`getSquareNumber(x, y) = (x + 1) + (y * 8)`, defined in both
`GameSquare.tsx` (rendering) and `GamePiece.tsx` (`getBoardCoordinates`,
the inverse). If one changes, the other must change with it.
