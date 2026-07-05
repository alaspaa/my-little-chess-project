import { useTranslation } from "react-i18next"

function Header() {
    const { t } = useTranslation()

    return (
        <header className="app-header">
            <h1>{t("header.title")}</h1>
        </header>
    )
}

export default Header
