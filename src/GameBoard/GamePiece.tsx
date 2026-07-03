import { type BoardCoordinates, type ChessPiece, type Square } from "../types/ChessObjects"
import { faChessBishop, faChessKing, faChessKnight, faChessPawn, faChessQueen, faChessRook } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useEffect, useRef } from "react"
import { gameBoardAtom, pieceClickedAtom, validMovesAtom } from "../state"
import { useAtom } from "jotai"
import { boardCoordinatesAtom } from "../state"
import validateMove from "../types/GameLogicValidator"
import getValidMoves from "../types/MoveValidator"

interface opts {
    piece: ChessPiece,
}

function GamePiece(props: opts) {
    const {piece } = props

    const pieceRef = useRef<HTMLDivElement>(null)
    const [pieceClicked, setPieceClicked] = useAtom(pieceClickedAtom)
    const [boardCoordinates, setBoardCoordinates] = useAtom(boardCoordinatesAtom)
    const [gameBoard, setGameBoard] = useAtom(gameBoardAtom)
    const [, setValidMoves] = useAtom(validMovesAtom)


    useEffect(() => {
        if(!pieceRef.current ) return

        const piece = pieceRef.current

        const onMouseDown = (e: MouseEvent) => {
            const id: string | null = (e.target as SVGPathElement).parentElement?.parentElement?.id || null
            if(!id) return

            setPieceClicked(id)

            const currentCoordinates = findPieceCoordinates(gameBoard, id)
            const clickedPiece = currentCoordinates && gameBoard[currentCoordinates.y][currentCoordinates.x].piece
            if(currentCoordinates && clickedPiece) {
                setValidMoves(getValidMoves(gameBoard, currentCoordinates, clickedPiece))
            }
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
            setValidMoves([])
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
        case "PAWN":
            return (<FontAwesomeIcon icon={faChessPawn} id={gamePiece.id} className={`chesspiece ${gamePiece.color}piece` } />);
            
        case "ROOK":
            return(<FontAwesomeIcon icon={faChessRook} id={gamePiece.id} className={`chesspiece ${gamePiece.color}piece` } />)
            
        case "KNIGHT":
            return(<FontAwesomeIcon icon={faChessKnight} id={gamePiece.id}   className={`chesspiece ${gamePiece.color}piece` } />)
        
        case "BISHOP":
            return(<FontAwesomeIcon icon={faChessBishop} id={gamePiece.id} className={`chesspiece ${gamePiece.color}piece` } />)
            
        case "KING":
            return(<FontAwesomeIcon icon={faChessKing} id={gamePiece.id} className={`chesspiece ${gamePiece.color}piece` } />)
            
        case "QUEEN":
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

function findPieceCoordinates(gameBoard: Square[][], pieceId: string): BoardCoordinates | null {
    for(let y = 0; y < gameBoard.length; y++) {
        for(let x = 0; x < gameBoard[y].length; x++) {
            if(gameBoard[y][x].piece?.id === pieceId) {
                return {x, y}
            }
        }
    }
    return null
}

function updateGameBoardWithMovedPiece(gameBoard: Square[][], pieceId: string, newCoordinates: BoardCoordinates): Square[][] {
    const originalCoordinates = findPieceCoordinates(gameBoard, pieceId)
    const piece = originalCoordinates && gameBoard[originalCoordinates.y][originalCoordinates.x].piece

    if(!piece || !originalCoordinates) return gameBoard

    const newBoard = gameBoard.map(row => row.map(square =>
        square.piece?.id === pieceId ? {...square, piece: null} : square
    ))

    return validateAndUpdateGameBoardWithMovedPiece(gameBoard, newBoard, originalCoordinates, newCoordinates, piece)
}

function validateAndUpdateGameBoardWithMovedPiece(
    currentGameBoard: Square[][], 
    newGameBoard: Square[][], 
    originalCoordinates: BoardCoordinates, 
    newCoordinates: BoardCoordinates,
    chessPiece: ChessPiece,
): Square[][] {
 if(!validateMove(currentGameBoard, originalCoordinates, newCoordinates, chessPiece)) return currentGameBoard
    

    newGameBoard[newCoordinates.y][newCoordinates.x] = {
        ...newGameBoard[newCoordinates.y][newCoordinates.x],
        piece: {...chessPiece, hasMoved: true}
    }

    return newGameBoard
}
export default GamePiece