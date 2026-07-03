import { useAtomValue } from 'jotai'
import GamePiece from './GamePiece'
import { type Square } from '../types/ChessObjects'
import { validMovesAtom } from '../state'

interface opts {
    gameSquare: Square,
    rowIndex: number,
    columnIndex: number,
}

function GameSquare(props: opts) {
    const {gameSquare, rowIndex, columnIndex } = props
    const validMoves = useAtomValue(validMovesAtom)

    const isValidMove = validMoves.some(move => move.x === columnIndex && move.y === rowIndex)

    return (
        <div
            key={getSquareNumber(columnIndex, rowIndex).toString()}
            id={getSquareNumber(columnIndex, rowIndex).toString()}
            className={'gamesquare ' + getColorClassName(columnIndex, rowIndex) + (isValidMove ? ' validmove' : '')}
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