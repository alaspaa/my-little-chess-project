import { useAtomValue, useSetAtom } from "jotai"
import { useTranslation } from "react-i18next"
import ModalFrame from "./ModalFrame"
import { gameStatusAtom, isGameOver, resetGameAtom } from "../state"

function RematchPrompt() {
    const { t } = useTranslation()
    const gameStatus = useAtomValue(gameStatusAtom)
    const resetGame = useSetAtom(resetGameAtom)

    if(!isGameOver(gameStatus.state)) return null

    return (
        <ModalFrame>
            <h2 className="modal-title">{t("rematchPrompt.title")}</h2>
            <p className="modal-description">{t("rematchPrompt.description")}</p>
            <div className="modal-actions">
                <button
                    type="button"
                    className="modal-accept-button"
                    onClick={() => resetGame()}
                >
                    {t("rematchPrompt.rematchButton")}
                </button>
            </div>
        </ModalFrame>
    )
}

export default RematchPrompt
