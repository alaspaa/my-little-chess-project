import { useTranslation } from 'react-i18next'
import { useSetAtom } from 'jotai'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons'
import type { TFunction } from 'i18next'
import { gameStatusAtom, isGameOver, type GameStatus } from '../state'
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
    const setGameStatus = useSetAtom(gameStatusAtom)

    const resign = () => {
        setGameStatus({state: 'resigned', color: currentTurn})
    }

    return (
        <footer className="game-footer">
            <div className="game-footer-top">
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
            </div>
            {!isGameOver(gameStatus.state) &&
                <div className="game-footer-actions">
                    <button
                        type="button"
                        className="resign-button"
                        onClick={resign}
                    >
                        {t('gameFooter.resignButton')}
                    </button>
                </div>
            }
        </footer>
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

    return ''
}

function getWinnerName(loserColor: CHESS_PIECE_COLOR | null, whitePlayer: Player | null, blackPlayer: Player | null, t: TFunction): string {
    const winnerColor = loserColor === 'white' ? 'black' : 'white'
    return getPlayerName(winnerColor, whitePlayer, blackPlayer, t)
}

function getPlayerName(color: 'white' | 'black' | null, whitePlayer: Player | null, blackPlayer: Player | null, t: TFunction): string {
    if(color === 'white') return whitePlayer?.name ?? t('common.white')
    if(color === 'black') return blackPlayer?.name ?? t('common.black')
    return ''
}

export default GameFooter
