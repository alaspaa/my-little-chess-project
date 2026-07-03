# Code style

Most of these conventions are derived from the existing codebase, not
imposed on top of it. A few sections below (marked as such) are rules the
project has explicitly opted into going forward, even where existing code
doesn't yet fully follow them — treat those as the standard for new/changed
code, and improve old code opportunistically rather than leaving the gap
undocumented.

## Readability

- Code should be human-readable first, clever second. A reader should be
  able to tell what a piece of code does at a glance, without needing to
  simulate it in their head or cross-reference other files.
- Variable and function names must be semantic and self-explanatory —
  name things after what they represent or do, not their type or position
  (`currentCoordinates`, `clickedPiece`, `isKingInCheck`, not `coords1`,
  `p`, `check`). If a name needs a comment to explain it, the name is
  wrong — rename it instead of commenting it.
- Prefer a slightly longer, clear name over a short, ambiguous one.
  Abbreviations are only acceptable when they're unambiguous and already
  used throughout the codebase (e.g. `x`/`y` for board coordinates).
- Keep functions small and single-purpose so the name can fully describe
  the behavior — if a function needs "and" in its description, it
  probably should be two functions.

## Formatting

- 4-space indentation.
- No semicolons at the end of statements.
- Quote style is mixed (single and double both appear) — no enforced rule,
  match whatever the surrounding file already uses.
- ESLint config (`eslint.config.js`) is close to the Vite/React template
  defaults (`js.configs.recommended`, `typescript-eslint` recommended,
  `react-hooks` recommended, `react-refresh`). No stylistic (Prettier-style)
  rules are enforced by lint — formatting consistency is by convention only.
- `npm run lint` runs automatically on every commit via a Husky
  `pre-commit` hook (`.husky/pre-commit`) — a commit is blocked if lint
  reports an error (warnings don't block). Run `npm install` once after
  cloning so the hook is registered (handled by the `prepare` script).

## Naming

- **Components**: PascalCase, one component per file, file name matches the
  component name (`GamePiece.tsx` exports `GamePiece`).
- **Component props**: declared as `interface opts { ... }` directly above
  the component (lowercase `opts`, not `Props`). Destructure props at the
  top of the function body: `const { piece } = props`.
- **Domain types**: PascalCase (`ChessPiece`, `Square`, `Player`,
  `BoardCoordinates`). Enum-like string unions use
  SCREAMING_SNAKE_CASE (`CHESS_PIECE_COLOR`, `CHESS_PIECE_TYPE`) — this is
  an existing exception, not a general rule for all types.
- **Jotai atoms**: camelCase, always suffixed `Atom`
  (`gameBoardAtom`, `currentTurnAtom`, `validMovesAtom`). All atoms live in
  the single top-level `src/state.ts`, not co-located with components.
- **Functions**: camelCase, verb-first (`getValidMoves`, `findKingCoordinates`,
  `updateGameBoardWithMovedPiece`). Boolean-returning functions are prefixed
  `is`/`has` (`isKingInCheck`, `isCheckmate`).

## Function style

- Top-level/module-scope helper functions are declared with
  `function name(...) { ... }`, not arrow-function consts.
- Arrow functions are reserved for values that live inside a component body
  or a callback passed inline (event handlers, `.map`/`.filter` callbacks,
  small closures like `getGamePieceIcon` inside `GamePiece`).
- Prefer small, single-purpose pure functions over large multi-branch ones
  — e.g. move validation is split per piece type
  (`getPawnMoves`, `getRookMoves`, `getKnightMoves`, ...) dispatched from
  one `switch` in `getValidMoves`, rather than one function handling every
  piece type inline.
- Business/domain logic (move generation, check detection, board setup) is
  kept in plain `.ts` files under `src/types/`, separate from the React
  components that call it. Components stay focused on rendering and
  wiring DOM events to that logic. This split is deliberate and required
  going forward: don't inline game-rule logic inside a `.tsx` component
  body — write it as a plain function in `src/types/`, then call it from
  the component. This is also what makes the logic testable (see
  Testability below) without needing to render anything.

## Testability

Tests run on [Vitest](https://vitest.dev) (`npm test`). Test files sit
next to the code they cover as `*.test.ts` (e.g.
`src/types/MoveValidator.test.ts`), not in a separate `__tests__` tree.
Import `describe`/`it`/`expect` explicitly from `"vitest"` rather than
relying on injected globals, so files type-check without extra config.
Shared test-only helpers (e.g. `buildBoard`/`piece` for constructing a
board with specific pieces on it) live in `src/testUtils.ts`.

Only the logic layer (`src/types/*.ts`) is covered so far — components
(`GamePiece`, `GameBoard`, `StartPage`) aren't tested yet, since they drive
everything through raw DOM mouse events and imperative style mutation
rather than props/return values; testing them meaningfully would need
that interaction extracted into something callable without a real drag.

What makes the logic layer testable, and should be preserved as more of
it is written:

- Keep game-rule logic (`src/types/*.ts`) as plain functions of
  `(gameBoard, coordinates, piece, ...)` that return a value — no DOM
  access, no atoms, no React — so they can be called directly in a test
  with a hand-built board, no rendering or event simulation required.
  `MoveValidator.ts` and `GameLogicValidator.ts` already follow this.
- Avoid hidden dependencies on global/module state inside logic functions;
  pass in everything a function needs as a parameter instead of reaching
  out to an atom or `document` from inside `src/types/`.
- Where a function's correctness matters most (move legality, check/
  checkmate detection), favor a form that's easy to assert against —
  return data (`BoardCoordinates[]`, `boolean`) rather than performing a
  side effect, so a future test can just check the return value.

## Imports

- Type-only imports use inline `type` markers:
  `import { type BoardCoordinates, type ChessPiece } from "./ChessObjects"`,
  not a separate `import type { ... }` statement.
- Relative imports (`../state`, `./MoveValidator`) throughout — no path
  aliases are configured.

## React patterns

- State is global (Jotai atoms in `state.ts`), not component-local state,
  except for genuinely ephemeral UI-only state (e.g. `StartPage`'s input
  values use local `useState` since they don't need to be read elsewhere
  until the Start button is pressed).
- Components read/write atoms directly with `useAtom`/`useAtomValue`/
  `useSetAtom` — no selector or context layer in between.
- Imperative DOM work (drag-follow behavior, `getElementById`,
  `elementsFromPoint`) is done inside `useEffect` + native event listeners
  on a `ref`, not through React's synthetic event props, because the drag
  interaction needs raw `mousemove`/`mouseup` coordinates. Keep this pattern
  contained to the component that owns the ref; don't reach into another
  component's DOM node from outside it.
