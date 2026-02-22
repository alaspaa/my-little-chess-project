import { type BoardCoordinates, type ChessPiece, CHESS_PIECE_COLOR, CHESS_PIECE_TYPE, type Square } from "../types/ChessObjects"
import { faChessBishop, faChessKing, faChessKnight, faChessPawn, faChessQueen, faChessRook } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useEffect, useRef } from "react"
import { gameBoardAtom, pieceClickedAtom } from "../state"
import { useAtom } from "jotai"
import { boardCoordinatesAtom } from "../state"

interface opts {
    piece: ChessPiece,
}

function GamePiece(props: opts) {
    const {piece } = props

    const pieceRef = useRef<HTMLDivElement>(null)
    const [pieceClicked, setPieceClicked] = useAtom(pieceClickedAtom)
    const [boardCoordinates, setBoardCoordinates] = useAtom(boardCoordinatesAtom)
    const [gameBoard, setGameBoard] = useAtom(gameBoardAtom)
  

    useEffect(() => {
        if(!pieceRef.current ) return 

        const piece = pieceRef.current

        const onMouseDown = (e: MouseEvent) => { 
            const id: string | null = (e.target as SVGPathElement).parentElement?.parentElement?.id || null
            if(!id) return

            setPieceClicked(id)         
        }

        const onMouseUp = () => {
            if(!boardCoordinates) return

            const gameSquare = document.elementsFromPoint(boardCoordinates.x, boardCoordinates.y)
            .find(el => {
                return el instanceof HTMLElement && el.classList.contains('gamesquare')
            }) 

            const gameBoardCoordinates = getGameBoardCoordinatesFromGameSquare(gameSquare)
            if(gameBoardCoordinates) {
                //console.log(`${gameBoardCoordinates?.x}, ${gameBoardCoordinates?.y}, ${pieceClicked}`)

                const newBoard = updateGameBoardWithMovedPiece(gameBoard, pieceClicked!, gameBoardCoordinates!)
                setGameBoard(newBoard)
            }

            const piece = (document.getElementById(pieceClicked!) as HTMLElement).firstChild as HTMLElement
            if(piece) {
                piece.style.removeProperty('position')
                piece.style.removeProperty('top')
                piece.style.removeProperty('left')
            }

            setBoardCoordinates(null)
            setPieceClicked(null)
        }

        piece.addEventListener('mousedown', onMouseDown)

        piece.addEventListener('mouseup', onMouseUp)

        const cleanup = () => {
            piece.removeEventListener('mousedown', onMouseDown)
            piece.removeEventListener('mouseup', onMouseUp)
        }
        
        return cleanup
    }, [pieceClicked, boardCoordinates])

    const getGamePieceIcon = (gamePiece: ChessPiece) => {
        switch(gamePiece.type) {
        case CHESS_PIECE_TYPE.PAWN:
            return (<FontAwesomeIcon icon={faChessPawn} id={gamePiece.id} className={`chesspiece ${gamePiece.color}piece` } />);
            
        case CHESS_PIECE_TYPE.ROOK:
            return(<FontAwesomeIcon icon={faChessRook} id={gamePiece.id} className={`chesspiece ${gamePiece.color}piece` } />)
            
        case CHESS_PIECE_TYPE.KNIGHT:
            return(<FontAwesomeIcon icon={faChessKnight} id={gamePiece.id}   className={`chesspiece ${gamePiece.color}piece` } />)
        
        case CHESS_PIECE_TYPE.BISHOP:
            return(<FontAwesomeIcon icon={faChessBishop} id={gamePiece.id} className={`chesspiece ${gamePiece.color}piece` } />)
            
        case CHESS_PIECE_TYPE.KING:
            return(<FontAwesomeIcon icon={faChessKing} id={gamePiece.id} className={`chesspiece ${gamePiece.color}piece` } />)
            
        case CHESS_PIECE_TYPE.QUEEN:
            return(<FontAwesomeIcon icon={faChessQueen} id={gamePiece.id} className={`chesspiece ${gamePiece.color}piece` } />)
    }
    }

    return(
        <div className="gamepiece" id={piece.id} ref={pieceRef}>
            {getGamePieceIcon(piece)}
        </div>
    )
    
}

function getBoardCoordinates(squareNumber: number): BoardCoordinates {
    const x = (squareNumber - 1) % 8
    const y = Math.floor((squareNumber - 1) / 8)
    return {x, y}
}

function getGameBoardCoordinatesFromGameSquare(gameSquare: Element | undefined): BoardCoordinates | null {
    if(!gameSquare) return null
    const id = gameSquare.id
    if(!id) return null

    return getBoardCoordinates(parseInt(id))
}

function updateGameBoardWithMovedPiece(gameBoard: Square[][], pieceId: string, newCoordinates: BoardCoordinates): Square[][] {
    let piece: ChessPiece | null = null

    let newBoard = gameBoard.map(row => 
        row.map(square => {
            if(square.piece && square.piece.id === pieceId) {
                piece = square.piece
                return {
                    ...square,
                    piece: null
                }
            } else {
                return square
            }
        }
        )
    )

    if (!piece) return gameBoard
    // TODO: validate move

    newBoard[newCoordinates.y][newCoordinates.x] = {
        ...newBoard[newCoordinates.y][newCoordinates.x],
        piece: piece
    }

    return newBoard
}

export default GamePiece