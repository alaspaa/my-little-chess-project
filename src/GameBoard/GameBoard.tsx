
import { useEffect, useRef, useState } from 'react'
import { type Square } from '../types/ChessObjects'
import { createEmptyBoard, populateBoardWithPieces } from '../types/GameBoard'
import GameBoardRow from './GameBoardRow'

interface opts {}

function GameBoard(props: opts) {
    const [gameBoard, setGameBoard] = useState<Square[][]>(createEmptyBoard())
    const [pieceClicked, setPieceClicked] = useState(false)
    
    const boardRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        setGameBoard([...populateBoardWithPieces(gameBoard)])

        if(!boardRef.current) return 

        const board = boardRef.current

        const onMouseMove = (e: MouseEvent) => {
             if(!pieceClicked) return
             console.log(e.clientX, e.clientY)
        }

        board.addEventListener('mousemove', onMouseMove)  

        const cleanup = () => {
            board.removeEventListener('mousemove', onMouseMove)
        }

        return cleanup
    }, [])

    return (
        <div className='gameboard' ref={boardRef}>
        {
          gameBoard.map( (row, index) =>
            <div key={`row${index}`} className="gameboardrow">
                <GameBoardRow 
                  row={row} 
                  rowIndex={index}  
                  isPieceClicked={pieceClicked} 
                  setPieceClicked={setPieceClicked}
                />               
            </div>
          )
        }
      </div>
    )
}

export default GameBoard