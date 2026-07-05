import { useEffect, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import { useAtom } from "jotai"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faGear } from "@fortawesome/free-solid-svg-icons"
import { highlightMovesEnabledAtom } from "../state"

function SettingsMenu() {
    const { t } = useTranslation()
    const [highlightMovesEnabled, setHighlightMovesEnabled] = useAtom(highlightMovesEnabledAtom)
    const [isOpen, setIsOpen] = useState(false)
    const menuRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if(!isOpen) return

        const onClickOutside = (e: MouseEvent) => {
            if(menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setIsOpen(false)
            }
        }

        document.addEventListener("mousedown", onClickOutside)
        return () => document.removeEventListener("mousedown", onClickOutside)
    }, [isOpen])

    return (
        <div className="settings-menu" ref={menuRef}>
            <button
                type="button"
                className="settings-menu-toggle"
                aria-label={t("header.settingsButtonLabel")}
                onClick={() => setIsOpen(open => !open)}
            >
                <FontAwesomeIcon icon={faGear} />
            </button>
            {isOpen &&
                <div className="settings-menu-panel">
                    <label className="settings-menu-option">
                        <input
                            type="checkbox"
                            checked={highlightMovesEnabled}
                            onChange={e => setHighlightMovesEnabled(e.target.checked)}
                        />
                        {t("header.highlightMovesLabel")}
                    </label>
                </div>
            }
        </div>
    )
}

export default SettingsMenu
