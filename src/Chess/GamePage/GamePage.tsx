import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect, useRef } from 'react'
import GameBoard from '../GameBoard/GameBoard'
import GameFooter from '../GameBoard/GameFooter'
import PromotionPrompt from '../Modal/PromotionPrompt'
import RematchPrompt from '../Modal/RematchPrompt'
import { capturedPiecesAtom, currentTurnAtom, gameStatusAtom, isGameOver, player1ColorAtom, scoreAtom, whitePlayerAtom, blackPlayerAtom } from '../../state'

function GamePage() {
    const whitePlayer = useAtomValue(whitePlayerAtom)
    const blackPlayer = useAtomValue(blackPlayerAtom)
    const currentTurn = useAtomValue(currentTurnAtom)
    const gameStatus = useAtomValue(gameStatusAtom)
    const capturedPieces = useAtomValue(capturedPiecesAtom)
    const player1Color = useAtomValue(player1ColorAtom)
    const setScore = useSetAtom(scoreAtom)

    // Tallies the result exactly once per game, the moment gameStatusAtom
    // transitions into an end state - not on every render while it stays
    // there (e.g. after a rematch resets it back to "playing").
    const wasGameOverRef = useRef(isGameOver(gameStatus.state))
    useEffect(() => {
        const wasGameOver = wasGameOverRef.current
        const isOver = isGameOver(gameStatus.state)
        wasGameOverRef.current = isOver
        if(!isOver || wasGameOver) return

        if(gameStatus.state === 'draw') {
            setScore(previous => ({...previous, draws: previous.draws + 1}))
        } else {
            const winnerColor = gameStatus.color === 'white' ? 'black' : 'white'
            setScore(previous => winnerColor === player1Color
                ? {...previous, player1: previous.player1 + 1}
                : {...previous, player2: previous.player2 + 1}
            )
        }
    }, [gameStatus.state, gameStatus.color, player1Color, setScore])

    return (
        <>
            <GameBoard />
            <GameFooter
                whitePlayer={whitePlayer}
                blackPlayer={blackPlayer}
                currentTurn={currentTurn}
                gameStatus={gameStatus}
                capturedPieces={capturedPieces}
            />
            <PromotionPrompt />
            <RematchPrompt />
        </>
    )
}

export default GamePage
