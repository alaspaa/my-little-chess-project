import { useTranslation } from 'react-i18next'
import Modal from '../Modal/Modal'

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
        <Modal onDismiss={onDecline}>
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
        </Modal>
    )
}

export default ConfirmModal
