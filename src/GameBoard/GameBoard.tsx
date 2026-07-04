import { useEffect, useRef} from 'react'
import GameBoardRow from './GameBoardRow'
import { useAtomValue, useSetAtom } from 'jotai'
import { boardCoordinatesAtom, gameBoardAtom, pieceClickedAtom } from '../state'

function GameBoard() {
    const gameBoard = useAtomValue(gameBoardAtom)
    const pieceClicked = useAtomValue(pieceClickedAtom)
    const setPieceCoords = useSetAtom(boardCoordinatesAtom)

    const boardRef = useRef<HTMLDivElement>(null)

    // Read via a ref inside the listener instead of depending on pieceClicked
    // in the effect, so the listener is attached once and always sees the
    // latest value without being torn down and re-added on every drag.
    const pieceClickedRef = useRef(pieceClicked)
    useEffect(() => {
        pieceClickedRef.current = pieceClicked
    })

    useEffect(() => {
        if(!boardRef.current) return
        const board = boardRef.current

        const onMouseMove = (e: MouseEvent) => {
            const clickedId = pieceClickedRef.current
            if(!clickedId) return
            const piece = document.getElementById(clickedId)?.childNodes[0] as SVGSVGElement

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
    }, [setPieceCoords])

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
