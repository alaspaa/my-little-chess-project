import { useState } from "react"
import { useTranslation } from "react-i18next"
import { useSetAtom } from "jotai"
import { currentPageAtom, player1Atom, player2Atom } from "../state"
import type { Player } from "../types/ChessObjects"

function StartPage() {
    const { t } = useTranslation()
    const [player1Name, setPlayer1Name] = useState("")
    const [player2Name, setPlayer2Name] = useState("")
    const [error, setError] = useState("")

    const setPlayer1 = useSetAtom(player1Atom)
    const setPlayer2 = useSetAtom(player2Atom)
    const setCurrentPage = useSetAtom(currentPageAtom)

    const onStart = () => {
        const trimmedPlayer1Name = player1Name.trim()
        const trimmedPlayer2Name = player2Name.trim()

        if(!trimmedPlayer1Name || !trimmedPlayer2Name) {
            setError(t("startPage.usernameRequiredError"))
            return
        }

        setPlayer1(createPlayer(trimmedPlayer1Name))
        setPlayer2(createPlayer(trimmedPlayer2Name))
        setCurrentPage("game")
    }

    return (
        <div className="startpage">
            <div className="startpage-field">
                <label htmlFor="player1-username">{t("startPage.player1UsernameLabel")}</label>
                <input
                    id="player1-username"
                    type="text"
                    value={player1Name}
                    onChange={e => setPlayer1Name(e.target.value)}
                />
            </div>
            <div className="startpage-field">
                <label htmlFor="player2-username">{t("startPage.player2UsernameLabel")}</label>
                <input
                    id="player2-username"
                    type="text"
                    value={player2Name}
                    onChange={e => setPlayer2Name(e.target.value)}
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
