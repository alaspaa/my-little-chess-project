import { useAtomValue } from 'jotai'
import GameBoard from '../GameBoard/GameBoard'
import GameFooter from '../GameBoard/GameFooter'
import PromotionPrompt from '../Modal/PromotionPrompt'
import { blackPlayerAtom, capturedPiecesAtom, currentTurnAtom, gameStatusAtom, whitePlayerAtom } from '../state'

function GamePage() {
    const whitePlayer = useAtomValue(whitePlayerAtom)
    const blackPlayer = useAtomValue(blackPlayerAtom)
    const currentTurn = useAtomValue(currentTurnAtom)
    const gameStatus = useAtomValue(gameStatusAtom)
    const capturedPieces = useAtomValue(capturedPiecesAtom)

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
        </>
    )
}

export default GamePage
