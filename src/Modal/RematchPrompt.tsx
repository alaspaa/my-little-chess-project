import { useAtomValue, useSetAtom } from "jotai"
import { useTranslation } from "react-i18next"
import ModalFrame from "./ModalFrame"
import { gameStatusAtom, isGameOver, player1ColorAtom, resetGameAtom } from "../state"

function RematchPrompt() {
    const { t } = useTranslation()
    const gameStatus = useAtomValue(gameStatusAtom)
    const resetGame = useSetAtom(resetGameAtom)
    const setPlayer1Color = useSetAtom(player1ColorAtom)

    if(!isGameOver(gameStatus.state)) return null

    const rematch = () => {
        resetGame()
    }

    const rematchSwapSides = () => {
        resetGame()
        setPlayer1Color(color => color === "white" ? "black" : "white")
    }

    return (
        <ModalFrame>
            <h2 className="modal-title">{t("rematchPrompt.title")}</h2>
            <p className="modal-description">{t("rematchPrompt.description")}</p>
            <div className="rematch-actions">
                <button
                    type="button"
                    className="rematch-button"
                    onClick={rematch}
                >
                    {t("rematchPrompt.rematchButton")}
                </button>
                <button
                    type="button"
                    className="rematch-swap-button"
                    onClick={rematchSwapSides}
                >
                    {t("rematchPrompt.rematchSwapSidesButton")}
                </button>
            </div>
        </ModalFrame>
    )
}

export default RematchPrompt
