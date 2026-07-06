import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSetAtom } from 'jotai'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons'
import type { TFunction } from 'i18next'
import { gameStatusAtom, isGameOver, type GameStatus } from '../state'
import type { CHESS_PIECE_COLOR, ChessPiece, Player } from '../types/ChessObjects'
import ConfirmModal from '../Modal/ConfirmModal'
import getPieceIcon from './pieceIcons'

interface opts {
    whitePlayer: Player | null,
    blackPlayer: Player | null,
    currentTurn: CHESS_PIECE_COLOR,
    gameStatus: GameStatus,
    capturedPieces: Record<CHESS_PIECE_COLOR, ChessPiece[]>,
}

function GameFooter(props: opts) {
    const { whitePlayer, blackPlayer, currentTurn, gameStatus, capturedPieces } = props
    const { t } = useTranslation()
    const setGameStatus = useSetAtom(gameStatusAtom)
    const [showResignConfirm, setShowResignConfirm] = useState(false)
    const [showDrawOffer, setShowDrawOffer] = useState(false)

    const resign = () => {
        setGameStatus({state: 'resigned', color: currentTurn})
        setShowResignConfirm(false)
    }

    const acceptDraw = () => {
        setGameStatus({state: 'draw', color: null})
        setShowDrawOffer(false)
    }

    return (
        <footer className="game-footer">
            <div className="game-footer-top">
                <div className={'gameboard-player player-white' + (currentTurn === 'white' ? ' active' : '')}>
                    <div className="gameboard-player-color">{t('common.white')}</div>
                    <div className="gameboard-player-name">{whitePlayer?.name}</div>
                    <CapturedPieces pieces={capturedPieces.white} />
                </div>
                <div className={`game-footer-status-wrapper ${gameStatus.state}`}>
                    <FontAwesomeIcon
                        icon={faArrowLeft}
                        className={'turn-arrow' + (currentTurn === 'white' ? ' active' : '')}
                    />
                    <div className={`game-footer-status ${gameStatus.state}`}>
                        {getGameStatusMessage(gameStatus, whitePlayer, blackPlayer, t)}
                    </div>
                    <FontAwesomeIcon
                        icon={faArrowRight}
                        className={'turn-arrow' + (currentTurn === 'black' ? ' active' : '')}
                    />
                </div>
                <div className={'gameboard-player player-black' + (currentTurn === 'black' ? ' active' : '')}>
                    <div className="gameboard-player-color">{t('common.black')}</div>
                    <div className="gameboard-player-name">{blackPlayer?.name}</div>
                    <CapturedPieces pieces={capturedPieces.black} />
                </div>
            </div>
            {!isGameOver(gameStatus.state) &&
                <div className="game-footer-actions">
                    <button
                        type="button"
                        className="game-footer-action-button"
                        onClick={() => setShowDrawOffer(true)}
                    >
                        {t('gameFooter.offerDrawButton')}
                    </button>
                    <button
                        type="button"
                        className="game-footer-action-button"
                        onClick={() => setShowResignConfirm(true)}
                    >
                        {t('gameFooter.resignButton')}
                    </button>
                </div>
            }
            {showResignConfirm &&
                <ConfirmModal
                    title={t('gameFooter.resignConfirmTitle', {player: getPlayerName(currentTurn, whitePlayer, blackPlayer, t)})}
                    description={t('gameFooter.resignConfirmDescription')}
                    onAccept={resign}
                    onDecline={() => setShowResignConfirm(false)}
                />
            }
            {showDrawOffer &&
                <ConfirmModal
                    title={t('gameFooter.drawOfferTitle', {opponent: getPlayerName(getOpponentColor(currentTurn), whitePlayer, blackPlayer, t)})}
                    description={t('gameFooter.drawOfferDescription', {player: getPlayerName(currentTurn, whitePlayer, blackPlayer, t)})}
                    onAccept={acceptDraw}
                    onDecline={() => setShowDrawOffer(false)}
                />
            }
        </footer>
    )
}

function CapturedPieces(props: {pieces: ChessPiece[]}) {
    const { pieces } = props

    return (
        <div className="captured-pieces">
            {pieces.map(piece =>
                <span key={piece.id} className="captured-piece-chip">
                    <FontAwesomeIcon
                        icon={getPieceIcon(piece.type)}
                        className={`captured-piece-icon ${piece.color}piece`}
                    />
                </span>
            )}
        </div>
    )
}

function getGameStatusMessage(gameStatus: GameStatus, whitePlayer: Player | null, blackPlayer: Player | null, t: TFunction): string {
    if(gameStatus.state === 'checkmate') {
        return t('gameStatus.checkmate', {winner: getWinnerName(gameStatus.color, whitePlayer, blackPlayer, t)})
    }

    if(gameStatus.state === 'resigned') {
        return t('gameStatus.resigned', {winner: getWinnerName(gameStatus.color, whitePlayer, blackPlayer, t)})
    }

    if(gameStatus.state === 'check') {
        return t('gameStatus.check', {player: getPlayerName(gameStatus.color, whitePlayer, blackPlayer, t)})
    }

    if(gameStatus.state === 'draw') {
        return t('gameStatus.draw')
    }

    return ''
}

function getWinnerName(loserColor: CHESS_PIECE_COLOR | null, whitePlayer: Player | null, blackPlayer: Player | null, t: TFunction): string {
    if(!loserColor) return ''
    return getPlayerName(getOpponentColor(loserColor), whitePlayer, blackPlayer, t)
}

function getOpponentColor(color: CHESS_PIECE_COLOR): CHESS_PIECE_COLOR {
    return color === 'white' ? 'black' : 'white'
}

function getPlayerName(color: 'white' | 'black' | null, whitePlayer: Player | null, blackPlayer: Player | null, t: TFunction): string {
    if(color === 'white') return whitePlayer?.name ?? t('common.white')
    if(color === 'black') return blackPlayer?.name ?? t('common.black')
    return ''
}

export default GameFooter
