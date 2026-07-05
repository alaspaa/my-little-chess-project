import { useTranslation } from "react-i18next"
import SettingsMenu from "./SettingsMenu"

function Header() {
    const { t } = useTranslation()

    return (
        <header className="app-header">
            <h1>{t("header.title")}</h1>
            <SettingsMenu />
        </header>
    )
}

export default Header
