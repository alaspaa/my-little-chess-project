import { useEffect, useRef} from 'react'
import GameBoardRow from './GameBoardRow'
import { useAtom, useAtomValue } from 'jotai'
import { blackPlayerAtom, boardCoordinatesAtom, currentTurnAtom, gameBoardAtom, gameStatusAtom, pieceClickedAtom, whitePlayerAtom } from '../state'
import type { Player } from '../types/ChessObjects'

function GameBoard() {
    const gameBoard = useAtomValue(gameBoardAtom)
    const pieceClicked = useAtomValue(pieceClickedAtom)
    const [pieceCoords, setPieceCoords] = useAtom(boardCoordinatesAtom)
    const whitePlayer = useAtomValue(whitePlayerAtom)
    const blackPlayer = useAtomValue(blackPlayerAtom)
    const currentTurn = useAtomValue(currentTurnAtom)
    const gameStatus = useAtomValue(gameStatusAtom)

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
        <>
        {gameStatus.state !== 'playing' &&
            <div className={`gameboard-status ${gameStatus.state}`}>
                {gameStatus.state === 'checkmate'
                    ? `Checkmate! ${getPlayerName(gameStatus.color === 'white' ? 'black' : 'white', whitePlayer, blackPlayer)} wins`
                    : `${getPlayerName(gameStatus.color, whitePlayer, blackPlayer)} is in check`}
            </div>
        }
        <div className={'gameboard-player black' + (currentTurn === 'white' ? ' active' : '')}>White: {whitePlayer?.name}</div>
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
      <div className={'gameboard-player black' + (currentTurn === 'black' ? ' active' : '')}>Black: {blackPlayer?.name}</div>
      </>
    )
}

function getPlayerName(color: 'white' | 'black' | null, whitePlayer: Player | null, blackPlayer: Player | null): string {
    if(color === 'white') return whitePlayer?.name ?? 'White'
    if(color === 'black') return blackPlayer?.name ?? 'Black'
    return ''
}

export default GameBoard