import { type BoardCoordinates, type ChessPiece, type Square } from "../types/ChessObjects"
import { faChessBishop, faChessKing, faChessKnight, faChessPawn, faChessQueen, faChessRook } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useEffect, useRef } from "react"
import { currentTurnAtom, gameBoardAtom, gameStatusAtom, pieceClickedAtom, validMovesAtom } from "../state"
import { useAtom } from "jotai"
import { boardCoordinatesAtom } from "../state"
import validateMove, { getLegalMoves, isCheckmate, isKingInCheck } from "../types/GameLogicValidator"

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
    const [currentTurn, setCurrentTurn] = useAtom(currentTurnAtom)
    const [gameStatus, setGameStatus] = useAtom(gameStatusAtom)

    // Read via refs inside the event listeners below instead of depending on
    // these atoms in the effect, so the listeners are attached once and
    // always see the latest values without being torn down and re-added.
    const pieceClickedRef = useRef(pieceClicked)
    const boardCoordinatesRef = useRef(boardCoordinates)
    const gameBoardRef = useRef(gameBoard)
    const currentTurnRef = useRef(currentTurn)
    const gameStatusRef = useRef(gameStatus)
    useEffect(() => {
        pieceClickedRef.current = pieceClicked
        boardCoordinatesRef.current = boardCoordinates
        gameBoardRef.current = gameBoard
        currentTurnRef.current = currentTurn
        gameStatusRef.current = gameStatus
    })

    useEffect(() => {
        if(!pieceRef.current ) return

        const piece = pieceRef.current

        const onMouseDown = (e: MouseEvent) => {
            if(gameStatusRef.current.state === "checkmate") return

            const id: string | null = (e.target as SVGPathElement).parentElement?.parentElement?.id || null
            if(!id) return

            const currentGameBoard = gameBoardRef.current
            const currentCoordinates = findPieceCoordinates(currentGameBoard, id)
            const clickedPiece = currentCoordinates && currentGameBoard[currentCoordinates.y][currentCoordinates.x].piece
            if(!currentCoordinates || !clickedPiece) return
            if(clickedPiece.color !== currentTurnRef.current) return

            setPieceClicked(id)
            setValidMoves(getLegalMoves(currentGameBoard, currentCoordinates, clickedPiece))
        }

        const onMouseUp = () => {
            const boardCoordinates = boardCoordinatesRef.current
            if(!boardCoordinates) return

            const gameSquare = document.elementsFromPoint(boardCoordinates.x, boardCoordinates.y)
            .find(el => {
                return el instanceof HTMLElement && el.classList.contains('gamesquare')
            })

            const pieceClicked = pieceClickedRef.current
            const currentGameBoard = gameBoardRef.current

            const gameBoardCoordinates = getGameBoardCoordinatesFromGameSquare(gameSquare)
            if(gameBoardCoordinates) {
                //console.log(`${gameBoardCoordinates?.x}, ${gameBoardCoordinates?.y}, ${pieceClicked}`)

                const newBoard = updateGameBoardWithMovedPiece(currentGameBoard, pieceClicked!, gameBoardCoordinates!)
                if(newBoard !== currentGameBoard) {
                    setGameBoard(newBoard)

                    const nextTurn = currentTurnRef.current === "white" ? "black" : "white"
                    setCurrentTurn(nextTurn)

                    if(isCheckmate(newBoard, nextTurn)) {
                        setGameStatus({state: "checkmate", color: nextTurn})
                    } else if(isKingInCheck(newBoard, nextTurn)) {
                        setGameStatus({state: "check", color: nextTurn})
                    } else {
                        setGameStatus({state: "playing", color: null})
                    }
                }
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
    }, [setPieceClicked, setValidMoves, setGameBoard, setCurrentTurn, setGameStatus, setBoardCoordinates])

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