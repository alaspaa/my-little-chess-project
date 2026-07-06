import type { ReactNode } from 'react'

interface opts {
    onDismiss?: () => void,
    children: ReactNode,
}

function ModalFrame(props: opts) {
    const { onDismiss, children } = props

    return (
        <div className="modal-overlay" onClick={onDismiss}>
            <div className="modal" onClick={e => e.stopPropagation()}>
                {children}
            </div>
        </div>
    )
}

export default ModalFrame
