import { useState } from "react"
import { useTranslation } from "react-i18next"
import { useAtom } from "jotai"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faGear } from "@fortawesome/free-solid-svg-icons"
import { highlightMovesEnabledAtom, languageAtom } from "../state"
import ModalFrame from "./ModalFrame"
import i18n from "../i18n"
import { LANGUAGES } from "./languages"

function SettingsMenu() {
    const { t } = useTranslation()
    const [highlightMovesEnabled, setHighlightMovesEnabled] = useAtom(highlightMovesEnabledAtom)
    const [language, setLanguage] = useAtom(languageAtom)
    const [isOpen, setIsOpen] = useState(false)

    const changeLanguage = (code: string) => {
        i18n.changeLanguage(code)
        setLanguage(code)
    }

    return (
        <>
            <button
                type="button"
                className="settings-menu-toggle"
                aria-label={t("header.settingsButtonLabel")}
                onClick={() => setIsOpen(true)}
            >
                <FontAwesomeIcon icon={faGear} />
            </button>
            {isOpen &&
                <ModalFrame onDismiss={() => setIsOpen(false)}>
                    <h2 className="modal-title settings-menu-title">{t("header.settingsButtonLabel")}</h2>
                    <label className="settings-menu-option">
                        <input
                            type="checkbox"
                            checked={highlightMovesEnabled}
                            onChange={e => setHighlightMovesEnabled(e.target.checked)}
                        />
                        {t("header.highlightMovesLabel")}
                    </label>
                    <label className="settings-menu-option">
                        {t("header.languageLabel")}
                        <select
                            className="settings-menu-language-select"
                            value={language}
                            onChange={e => changeLanguage(e.target.value)}
                        >
                            {LANGUAGES.map(lang =>
                                <option key={lang.code} value={lang.code}>
                                    {lang.flag} {lang.label}
                                </option>
                            )}
                        </select>
                    </label>
                    <button
                        type="button"
                        className="settings-menu-close-button"
                        onClick={() => setIsOpen(false)}
                    >
                        {t("common.close")}
                    </button>
                </ModalFrame>
            }
        </>
    )
}

export default SettingsMenu
