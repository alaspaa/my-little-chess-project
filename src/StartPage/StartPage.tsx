import { useState } from "react"
import { useTranslation } from "react-i18next"
import { useSetAtom } from "jotai"
import { blackPlayerAtom, currentPageAtom, whitePlayerAtom } from "../state"
import type { Player } from "../types/ChessObjects"

function StartPage() {
    const { t } = useTranslation()
    const [whiteName, setWhiteName] = useState("")
    const [blackName, setBlackName] = useState("")
    const [error, setError] = useState("")

    const setWhitePlayer = useSetAtom(whitePlayerAtom)
    const setBlackPlayer = useSetAtom(blackPlayerAtom)
    const setCurrentPage = useSetAtom(currentPageAtom)

    const onStart = () => {
        const trimmedWhiteName = whiteName.trim()
        const trimmedBlackName = blackName.trim()

        if(!trimmedWhiteName || !trimmedBlackName) {
            setError(t("startPage.usernameRequiredError"))
            return
        }

        setWhitePlayer(createPlayer(trimmedWhiteName))
        setBlackPlayer(createPlayer(trimmedBlackName))
        setCurrentPage("game")
    }

    return (
        <div className="startpage">
            <h1>{t("startPage.title")}</h1>
            <div className="startpage-field">
                <label htmlFor="white-username">{t("startPage.whiteUsernameLabel")}</label>
                <input
                    id="white-username"
                    type="text"
                    value={whiteName}
                    onChange={e => setWhiteName(e.target.value)}
                />
            </div>
            <div className="startpage-field">
                <label htmlFor="black-username">{t("startPage.blackUsernameLabel")}</label>
                <input
                    id="black-username"
                    type="text"
                    value={blackName}
                    onChange={e => setBlackName(e.target.value)}
                />
            </div>
            {error && <p className="startpage-error">{error}</p>}
            <button type="button" onClick={onStart}>{t("startPage.startButton")}</button>
        </div>
    )
}

function createPlayer(name: string): Player {
    return {
        id: crypto.randomUUID(),
        name,
    }
}

export default StartPage
