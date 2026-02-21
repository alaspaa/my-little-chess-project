import GamePiece from './GamePiece'
import { type Square } from '../types/ChessObjects'
import { useEffect, useRef } from 'react'
import GameSquare from './GameSquare'

interface opts {
    row: Square[],
    rowIndex: number,
    setPieceClicked: (bool: boolean) => void
    isPieceClicked: boolean
}

function GameBoardRow(props: opts) {
    const {row, rowIndex, setPieceClicked, isPieceClicked} = props

    const hoveredSquare = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if(!hoveredSquare.current) return

        const square = hoveredSquare.current

        const onHover = (e: MouseEvent) => {
            const id = e.target instanceof HTMLElement ? e.target.id : "No id"
            console.log(id)
            //console.log("Mouse entered square " + getSquareNumber(rowIndex, rowIndex))
        }

        square.addEventListener('mouseover', onHover)
  
        const cleanup = () => {
            square.removeEventListener('mouseover', onHover)
        }

        return cleanup

    }, [])

   return (
    <>
        { 
            row.map((gameSquare, index) =>
                <>
                    <GameSquare 
                        gameSquare={gameSquare} 
                        columnIndex={index} 
                        rowIndex={rowIndex}
                        setPieceClicked={setPieceClicked}
                        isPieceClicked={isPieceClicked}
                    />    
                </>
            )
        }
    </>
   )
  }

export default GameBoardRow