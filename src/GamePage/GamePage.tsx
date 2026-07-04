import { useAtomValue } from 'jotai'
import GameBoard from '../GameBoard/GameBoard'
import GameFooter from '../GameBoard/GameFooter'
import { blackPlayerAtom, currentTurnAtom, gameStatusAtom, whitePlayerAtom } from '../state'

function GamePage() {
    const whitePlayer = useAtomValue(whitePlayerAtom)
    const blackPlayer = useAtomValue(blackPlayerAtom)
    const currentTurn = useAtomValue(currentTurnAtom)
    const gameStatus = useAtomValue(gameStatusAtom)

    return (
        <>
            <GameBoard />
            <GameFooter
                whitePlayer={whitePlayer}
                blackPlayer={blackPlayer}
                currentTurn={currentTurn}
                gameStatus={gameStatus}
            />
        </>
    )
}

export default GamePage
