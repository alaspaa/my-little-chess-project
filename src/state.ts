import { atom } from "jotai";
import { type BoardCoordinates } from "./types/ChessObjects";
import { createEmptyBoard, populateBoardWithPieces } from "./types/GameBoard";

export const pieceClickedAtom = atom<string | null>(null)
export const boardCoordinatesAtom = atom<BoardCoordinates | null>(null)
export const pieceClickedIdAtom = atom<string | null>(null)
export const gameBoardAtom = atom(
    populateBoardWithPieces(createEmptyBoard())
)
