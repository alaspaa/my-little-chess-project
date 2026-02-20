import { useEffect, useState } from 'react'
import './App.css'
import { type Square } from './types/ChessObjects'
import { createEmptyBoard, populateBoardWithPieces } from './types/GameBoard'
import BoardRow from './BoardRow'


function App() {
    
    const [board, setBoard] = useState<Square[][]>(createEmptyBoard())

  useEffect(() => {
    const poupulatedBoard = populateBoardWithPieces(board)

    setBoard([...poupulatedBoard])
  }, [])

  return (
    <>
      <div className='gameboard'>
        {
          board.map( (row, index) =>
            <div key={`row${index}`} className="gameboardrow">
                <BoardRow row={row} rowIndex={index} />               
            </div>
          )
        }
      </div> 
    </>
  )
}

export default App
