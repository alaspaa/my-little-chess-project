import { useTranslation } from 'react-i18next'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons'
import type { TFunction } from 'i18next'
import type { GameStatus } from '../state'
import type { CHESS_PIECE_COLOR, Player } from '../types/ChessObjects'

interface opts {
    whitePlayer: Player | null,
    blackPlayer: Player | null,
    currentTurn: CHESS_PIECE_COLOR,
    gameStatus: GameStatus,
}

function GameFooter(props: opts) {
    const { whitePlayer, blackPlayer, currentTurn, gameStatus } = props
    const { t } = useTranslation()

    return (
        <footer className="game-footer">
            <div className={'gameboard-player player-white' + (currentTurn === 'white' ? ' active' : '')}>
                <div className="gameboard-player-color">{t('common.white')}</div>
                <div className="gameboard-player-name">{whitePlayer?.name}</div>
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
            </div>
        </footer>
    )
}

function getGameStatusMessage(gameStatus: GameStatus, whitePlayer: Player | null, blackPlayer: Player | null, t: TFunction): string {
    if(gameStatus.state === 'checkmate') {
        const winnerColor = gameStatus.color === 'white' ? 'black' : 'white'
        return t('gameStatus.checkmate', {winner: getPlayerName(winnerColor, whitePlayer, blackPlayer, t)})
    }

    if(gameStatus.state === 'check') {
        return t('gameStatus.check', {player: getPlayerName(gameStatus.color, whitePlayer, blackPlayer, t)})
    }

    return ''
}

function getPlayerName(color: 'white' | 'black' | null, whitePlayer: Player | null, blackPlayer: Player | null, t: TFunction): string {
    if(color === 'white') return whitePlayer?.name ?? t('common.white')
    if(color === 'black') return blackPlayer?.name ?? t('common.black')
    return ''
}

export default GameFooter
