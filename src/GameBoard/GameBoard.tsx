import { useEffect, useRef} from 'react'
import GameBoardRow from './GameBoardRow'
import GameFooter from './GameFooter'
import { useAtomValue, useSetAtom } from 'jotai'
import { blackPlayerAtom, boardCoordinatesAtom, currentTurnAtom, gameBoardAtom, gameStatusAtom, pieceClickedAtom, whitePlayerAtom } from '../state'
import type { Player } from '../types/ChessObjects'

function GameBoard() {
    const gameBoard = useAtomValue(gameBoardAtom)
    const pieceClicked = useAtomValue(pieceClickedAtom)
    const setPieceCoords = useSetAtom(boardCoordinatesAtom)
    const whitePlayer = useAtomValue(whitePlayerAtom)
    const blackPlayer = useAtomValue(blackPlayerAtom)
    const currentTurn = useAtomValue(currentTurnAtom)
    const gameStatus = useAtomValue(gameStatusAtom)

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
        <>
        {gameStatus.state !== 'playing' &&
            <div className={`gameboard-status ${gameStatus.state}`}>
                {gameStatus.state === 'checkmate'
                    ? `Checkmate! ${getPlayerName(gameStatus.color === 'white' ? 'black' : 'white', whitePlayer, blackPlayer)} wins`
                    : `${getPlayerName(gameStatus.color, whitePlayer, blackPlayer)} is in check`}
            </div>
        }
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
      <GameFooter whitePlayer={whitePlayer} blackPlayer={blackPlayer} currentTurn={currentTurn} />
      </>
    )
}

function getPlayerName(color: 'white' | 'black' | null, whitePlayer: Player | null, blackPlayer: Player | null): string {
    if(color === 'white') return whitePlayer?.name ?? 'White'
    if(color === 'black') return blackPlayer?.name ?? 'Black'
    return ''
}

export default GameBoard