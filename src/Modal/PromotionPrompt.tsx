import { useAtom, useSetAtom } from "jotai"
import { useTranslation } from "react-i18next"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import ModalFrame from "./ModalFrame"
import getPieceIcon from "../GameBoard/pieceIcons"
import { currentTurnAtom, gameBoardAtom, gameStatusAtom, pendingPromotionAtom, positionHistoryAtom } from "../state"
import { isCheckmate, isKingInCheck, isThreefoldRepetition } from "../GameLogic/GameLogicValidator"
import { serializePosition } from "../GameLogic/Position"
import type { CHESS_PIECE_TYPE } from "../types/ChessObjects"

const PROMOTION_CHOICES: CHESS_PIECE_TYPE[] = ["QUEEN", "ROOK", "BISHOP", "KNIGHT"]

function PromotionPrompt() {
    const { t } = useTranslation()
    const [pendingPromotion, setPendingPromotion] = useAtom(pendingPromotionAtom)
    const [gameBoard, setGameBoard] = useAtom(gameBoardAtom)
    const setCurrentTurn = useSetAtom(currentTurnAtom)
    const setGameStatus = useSetAtom(gameStatusAtom)
    const [positionHistory, setPositionHistory] = useAtom(positionHistoryAtom)

    if(!pendingPromotion) return null

    const choosePiece = (type: CHESS_PIECE_TYPE) => {
        const { coordinates, color } = pendingPromotion
        const pawn = gameBoard[coordinates.y][coordinates.x].piece
        if(!pawn) return

        const newBoard = gameBoard.map((row, y) =>
            row.map((square, x) =>
                x === coordinates.x && y === coordinates.y
                    ? {...square, piece: {...pawn, type}}
                    : square
            )
        )
        setGameBoard(newBoard)

        const nextTurn = color === "white" ? "black" : "white"
        setCurrentTurn(nextTurn)

        const position = serializePosition(newBoard, nextTurn)
        const newPositionHistory = [...positionHistory, position]
        setPositionHistory(newPositionHistory)

        if(isCheckmate(newBoard, nextTurn)) {
            setGameStatus({state: "checkmate", color: nextTurn})
        } else if(isThreefoldRepetition(newPositionHistory, position)) {
            setGameStatus({state: "draw", color: null})
        } else if(isKingInCheck(newBoard, nextTurn)) {
            setGameStatus({state: "check", color: nextTurn})
        } else {
            setGameStatus({state: "playing", color: null})
        }

        setPendingPromotion(null)
    }

    return (
        <ModalFrame>
            <h2 className="modal-title">{t("pawnPromotion.title")}</h2>
            <p className="modal-description">{t("pawnPromotion.description")}</p>
            <div className="promotion-choices">
                {PROMOTION_CHOICES.map(type =>
                    <button
                        key={type}
                        type="button"
                        className="promotion-choice-button"
                        aria-label={t(`pawnPromotion.${type.toLowerCase()}`)}
                        onClick={() => choosePiece(type)}
                    >
                        <FontAwesomeIcon icon={getPieceIcon(type)} className={`chesspiece ${pendingPromotion.color}piece`} />
                    </button>
                )}
            </div>
        </ModalFrame>
    )
}

export default PromotionPrompt
