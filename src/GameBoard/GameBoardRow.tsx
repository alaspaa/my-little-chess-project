import GamePiece from './GamePiece'
import { type BoardCoordinates, type Square } from '../types/ChessObjects'
import { useEffect, useRef } from 'react'
import GameSquare from './GameSquare'
import { useAtomValue } from 'jotai'
import { pieceClickedAtom } from '../state'

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