import { atom } from "jotai";
import { type BoardCoordinates, type CHESS_PIECE_COLOR, type ChessPiece, type Player } from "./types/ChessObjects";
import { createEmptyBoard, populateBoardWithPieces } from "./types/GameBoard";
import i18n from "./i18n";

export type Page = "setup" | "game"

export type GameStatus = {
    state: "playing" | "check" | "checkmate" | "resigned",
    color: CHESS_PIECE_COLOR | null,
}

export function isGameOver(state: GameStatus["state"]): boolean {
    return state === "checkmate" || state === "resigned"
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
