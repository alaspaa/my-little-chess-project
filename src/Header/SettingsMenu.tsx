import { useState } from "react"
import { useTranslation } from "react-i18next"
import { useAtom } from "jotai"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faGear } from "@fortawesome/free-solid-svg-icons"
import { highlightMovesEnabledAtom } from "../state"
import Modal from "../Modal/Modal"

function SettingsMenu() {
    const { t } = useTranslation()
    const [highlightMovesEnabled, setHighlightMovesEnabled] = useAtom(highlightMovesEnabledAtom)
    const [isOpen, setIsOpen] = useState(false)

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
                <Modal onDismiss={() => setIsOpen(false)}>
                    <h2 className="modal-title settings-menu-title">{t("header.settingsButtonLabel")}</h2>
                    <label className="settings-menu-option">
                        <input
                            type="checkbox"
                            checked={highlightMovesEnabled}
                            onChange={e => setHighlightMovesEnabled(e.target.checked)}
                        />
                        {t("header.highlightMovesLabel")}
                    </label>
                    <button
                        type="button"
                        className="settings-menu-close-button"
                        onClick={() => setIsOpen(false)}
                    >
                        {t("common.close")}
                    </button>
                </Modal>
            }
        </>
    )
}

export default SettingsMenu
