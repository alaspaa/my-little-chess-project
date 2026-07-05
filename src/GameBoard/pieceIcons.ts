import { faChessBishop, faChessKing, faChessKnight, faChessPawn, faChessQueen, faChessRook } from '@fortawesome/free-solid-svg-icons'
import type { IconDefinition } from '@fortawesome/free-solid-svg-icons'
import type { CHESS_PIECE_TYPE } from '../types/ChessObjects'

const PIECE_ICONS: Record<CHESS_PIECE_TYPE, IconDefinition> = {
    PAWN: faChessPawn,
    ROOK: faChessRook,
    KNIGHT: faChessKnight,
    BISHOP: faChessBishop,
    KING: faChessKing,
    QUEEN: faChessQueen,
}

function getPieceIcon(type: CHESS_PIECE_TYPE): IconDefinition {
    return PIECE_ICONS[type]
}

export default getPieceIcon
