import { useAtomValue } from 'jotai'
import GamePiece from './GamePiece'
import { type Square } from '../types/ChessObjects'
import { highlightMovesEnabledAtom, pickedUpPieceAtom, validMovesAtom } from '../../state'
import { isCastlingMove, isPawnPromotion } from '../GameLogic/MoveResolver'

interface opts {
    gameSquare: Square,
    rowIndex: number,
    columnIndex: number,
}

function GameSquare(props: opts) {
    const {gameSquare, rowIndex, columnIndex } = props
    const validMoves = useAtomValue(validMovesAtom)
    const highlightMovesEnabled = useAtomValue(highlightMovesEnabledAtom)
    const pickedUpPiece = useAtomValue(pickedUpPieceAtom)

    const destination = {x: columnIndex, y: rowIndex}
    const isValidMove = highlightMovesEnabled && validMoves.some(move => move.x === columnIndex && move.y === rowIndex)
    const isValidCapture = isValidMove && !!gameSquare.piece
    const isValidPromotion = isValidMove && !!pickedUpPiece && isPawnPromotion(pickedUpPiece.piece, destination)
    const isValidCastle = isValidMove && !!pickedUpPiece && isCastlingMove(pickedUpPiece.piece, pickedUpPiece.coordinates, destination)

    const highlightClassName = isValidPromotion ? ' validpromotion'
        : isValidCastle ? ' validcastle'
        : isValidCapture ? ' validcapture'
        : isValidMove ? ' validmove'
        : ''

    return (
        <div
            key={getSquareNumber(columnIndex, rowIndex).toString()}
            id={getSquareNumber(columnIndex, rowIndex).toString()}
            className={'gamesquare ' + getColorClassName(columnIndex, rowIndex) + highlightClassName}
        >
            {gameSquare.piece &&
                <GamePiece
                    piece={gameSquare.piece}
                />
            }
        </div>
    )
}

function getSquareNumber(index: number, rowIndex: number): number {
        return (index+1) + (rowIndex * 8)
    }

function isBlack(index: number, rowIndex: number): boolean {
    if((rowIndex + 1) % 2 == 0) {
        return (index + 1) % 2 != 0
    } else {
        return (index + 1) % 2 == 0
    }
}

function getColorClassName(index: number, rowIndex: number): string {
    return isBlack(index, rowIndex) ? 'square-black' : 'square-white'
}


export default GameSquare