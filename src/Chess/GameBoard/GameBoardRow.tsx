import { type Square } from '../types/ChessObjects'
import GameSquare from './GameSquare'


interface opts {
    row: Square[],
    rowIndex: number,
}

function GameBoardRow(props: opts) {
    const {row, rowIndex } = props

   return (
    <>
        { 
            row.map((gameSquare, index) =>
                <>
                    <GameSquare 
                        key={index + rowIndex * 8}
                        gameSquare={gameSquare} 
                        columnIndex={index} 
                        rowIndex={rowIndex}
                    />    
                </>
            )
        }
    </>
   )
  }

export default GameBoardRow