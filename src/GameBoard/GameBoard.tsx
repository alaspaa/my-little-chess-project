
import { useEffect, useState } from 'react'
import { type Square } from '../types/ChessObjects'
import { createEmptyBoard, populateBoardWithPieces } from '../types/GameBoard'
import GameBoardRow from './GameBoardRow'

interface opts {}

function GameBoard(props: opts) {
    const [board, setBoard] = useState<Square[][]>(createEmptyBoard())

    useEffect(() => {
        const poupulatedBoard = populateBoardWithPieces(board)

        setBoard([...poupulatedBoard])
    }, [])

    return (
        <div className='gameboard'>
        {
          board.map( (row, index) =>
            <div key={`row${index}`} className="gameboardrow">
                <GameBoardRow row={row} rowIndex={index} />               
            </div>
          )
        }
      </div>
    )
}

export default GameBoard