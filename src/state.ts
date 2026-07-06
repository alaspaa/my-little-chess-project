import { atom } from "jotai";
import { type BoardCoordinates, type CHESS_PIECE_COLOR, type ChessPiece, type Player } from "./types/ChessObjects";
import { createEmptyBoard, populateBoardWithPieces } from "./types/GameBoard";
import i18n from "./i18n";

export type Page = "setup" | "game"

export type GameStatus = {
    state: "playing" | "check" | "checkmate" | "resigned" | "draw",
    color: CHESS_PIECE_COLOR | null,
}

export function isGameOver(state: GameStatus["state"]): boolean {
    return state === "checkmate" || state === "resigned" || state === "draw"
}

export const pieceClickedAtom = atom<string | null>(null)
export const boardCoordinatesAtom = atom<BoardCoordinates | null>(null)
export const pieceClickedIdAtom = atom<string | null>(null)
export const validMovesAtom = atom<BoardCoordinates[]>([])
export const gameBoardAtom = atom(
    populateBoardWithPieces(createEmptyBoard())
)

export const currentPageAtom = atom<Page>("setup")
export const whitePlayerAtom = atom<Player | null>(null)
export const blackPlayerAtom = atom<Player | null>(null)
export const currentTurnAtom = atom<CHESS_PIECE_COLOR>("white")
export const gameStatusAtom = atom<GameStatus>({state: "playing", color: null})
export const highlightMovesEnabledAtom = atom(true)
// Mirrors i18n.language into an atom so components re-render on change via
// Jotai's subscription rather than hooking into i18next's own event emitter.
export const languageAtom = atom<string>(i18n.language)

// Keyed by the color that captured the pieces (e.g. capturedPiecesAtom.white
// is the black pieces white has taken), so each side's footer area can
// render its own trophies directly.
export const capturedPiecesAtom = atom<Record<CHESS_PIECE_COLOR, ChessPiece[]>>({white: [], black: []})

export type PendingPromotion = {
    color: CHESS_PIECE_COLOR,
    coordinates: BoardCoordinates,
}
export const pendingPromotionAtom = atom<PendingPromotion | null>(null)

// Serialized (board + side-to-move) snapshot appended after every completed
// move, for threefold repetition detection.
export const positionHistoryAtom = atom<string[]>([])

// Keyed by player slot (whoever started as White/Black in the first game),
// not color - so a future "switch sides on rematch" feature doesn't
// invalidate the tally. `resetGameAtom` deliberately never touches this,
// since the whole point is for it to survive across rematches.
export type Score = {
    player1: number,
    player2: number,
    draws: number,
}
export const scoreAtom = atom<Score>({player1: 0, player2: 0, draws: 0})

// Write-only action atom: puts every per-game (not per-session/settings)
// atom back to its starting value, for RematchPrompt's "play again" button.
// whitePlayerAtom/blackPlayerAtom and settings atoms are deliberately left
// alone - a rematch keeps the same two players, not just the same board.
export const resetGameAtom = atom(null, (_get, set) => {
    set(gameBoardAtom, populateBoardWithPieces(createEmptyBoard()))
    set(currentTurnAtom, "white")
    set(gameStatusAtom, {state: "playing", color: null})
    set(capturedPiecesAtom, {white: [], black: []})
    set(positionHistoryAtom, [])
    set(pendingPromotionAtom, null)
    set(validMovesAtom, [])
    set(pieceClickedAtom, null)
    set(boardCoordinatesAtom, null)
})
