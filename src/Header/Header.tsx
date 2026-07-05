import { useTranslation } from "react-i18next"
import { useAtom } from "jotai"
import { highlightMovesEnabledAtom } from "../state"

function Header() {
    const { t } = useTranslation()
    const [highlightMovesEnabled, setHighlightMovesEnabled] = useAtom(highlightMovesEnabledAtom)

    return (
        <header className="app-header">
            <h1>{t("header.title")}</h1>
            <label className="app-header-setting">
                <input
                    type="checkbox"
                    checked={highlightMovesEnabled}
                    onChange={e => setHighlightMovesEnabled(e.target.checked)}
                />
                {t("header.highlightMovesLabel")}
            </label>
        </header>
    )
}

export default Header
