import { useEffect, useRef} from 'react'
import GameBoardRow from './GameBoardRow'
import { useAtom, useAtomValue } from 'jotai'
import { boardCoordinatesAtom, gameBoardAtom, pieceClickedAtom } from '../state'

function GameBoard() {
    const gameBoard = useAtomValue(gameBoardAtom)
    const pieceClicked = useAtomValue(pieceClickedAtom)
    const [pieceCoords, setPieceCoords] = useAtom(boardCoordinatesAtom)

    const boardRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if(!boardRef.current) return 
        const board = boardRef.current

        const onMouseMove = (e: MouseEvent) => {
          if(!pieceClicked) return
            const piece = document.getElementById(pieceClicked)?.childNodes[0] as SVGSVGElement

            if(piece) {
                piece.style.position = "absolute"
                const x = e.clientX - 30
                const y = e.clientY - 40

                setPieceCoords({x: e.clientX, y: e.clientY})
                piece.style.top = `${y}px`
                piece.style.left = `${x}px`
            }
        }

        board.addEventListener('mousemove', onMouseMove)  

        const cleanup = () => {
            board.removeEventListener('mousemove', onMouseMove)
        }

        return cleanup
    }, [pieceClicked, pieceCoords])

    return (
        <div className='gameboard' ref={boardRef}>
        {
          gameBoard.map( (row, index) =>
            <div key={`row${index}`} className="gameboardrow">
                <GameBoardRow 
                  row={row} 
                  rowIndex={index}  
                />               
            </div>
          )
        }
      </div>
    )
}

export default GameBoard