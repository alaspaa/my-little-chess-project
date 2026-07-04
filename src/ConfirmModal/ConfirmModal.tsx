import { useTranslation } from 'react-i18next'

interface opts {
    title: string,
    description?: string,
    acceptLabel?: string,
    declineLabel?: string,
    onAccept: () => void,
    onDecline: () => void,
}

function ConfirmModal(props: opts) {
    const { title, description, acceptLabel = 'Confirm', declineLabel = 'Cancel', onAccept, onDecline } = props
    const { t } = useTranslation()

    return (
        <div className="modal-overlay" onClick={onDecline}>
            <div className="modal" onClick={e => e.stopPropagation()}>
                <h2 className="modal-title">{title}</h2>
                {description && <p className="modal-description">{description}</p>}
                <div className="modal-actions">
                    <button type="button" className="modal-accept-button" onClick={onAccept}>
                        {acceptLabel ?? t('common.confirm')}
                    </button>
                    <button type="button" className="modal-decline-button" onClick={onDecline}>
                        {declineLabel ?? t('common.cancel')}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ConfirmModal
