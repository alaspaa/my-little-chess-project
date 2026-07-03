import type { CHESS_PIECE_COLOR, Player } from '../types/ChessObjects'

interface opts {
    whitePlayer: Player | null,
    blackPlayer: Player | null,
    currentTurn: CHESS_PIECE_COLOR,
}

function GameFooter(props: opts) {
    const { whitePlayer, blackPlayer, currentTurn } = props

    return (
        <footer className="game-footer">
            <div className={'gameboard-player player-white' + (currentTurn === 'white' ? ' active' : '')}>
                <div className="gameboard-player-color">White</div>
                <div className="gameboard-player-name">{whitePlayer?.name}</div>
            </div>
            <div className={'gameboard-player player-black' + (currentTurn === 'black' ? ' active' : '')}>
                <div className="gameboard-player-color">Black</div>
                <div className="gameboard-player-name">{blackPlayer?.name}</div>
            </div>
        </footer>
    )
}

export default GameFooter
