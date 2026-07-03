import { useState } from "react"
import { useSetAtom } from "jotai"
import { blackPlayerAtom, currentPageAtom, whitePlayerAtom } from "../state"
import type { Player } from "../types/ChessObjects"

function StartPage() {
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
            setError("Both players need a username to start the game")
            return
        }

        setWhitePlayer(createPlayer(trimmedWhiteName))
        setBlackPlayer(createPlayer(trimmedBlackName))
        setCurrentPage("game")
    }

    return (
        <div className="startpage">
            <h1>Chess</h1>
            <div className="startpage-field">
                <label htmlFor="white-username">White username</label>
                <input
                    id="white-username"
                    type="text"
                    value={whiteName}
                    onChange={e => setWhiteName(e.target.value)}
                />
            </div>
            <div className="startpage-field">
                <label htmlFor="black-username">Black username</label>
                <input
                    id="black-username"
                    type="text"
                    value={blackName}
                    onChange={e => setBlackName(e.target.value)}
                />
            </div>
            {error && <p className="startpage-error">{error}</p>}
            <button type="button" onClick={onStart}>Start</button>
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
