import { type BoardCoordinates, type ChessPiece, type Square } from "../types/ChessObjects"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useEffect, useRef } from "react"
import { capturedPiecesAtom, currentTurnAtom, gameBoardAtom, gameStatusAtom, isGameOver, pendingPromotionAtom, pieceClickedAtom, validMovesAtom } from "../state"
import { useAtom } from "jotai"
import { boardCoordinatesAtom } from "../state"
import validateMove, { getLegalMoves, isCheckmate, isKingInCheck } from "../types/GameLogicValidator"
import { getCastlingRookMove, isCastlingMove, isPawnPromotion } from "../types/MoveValidator"
import getPieceIcon from "./pieceIcons"

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
    const [, setCapturedPieces] = useAtom(capturedPiecesAtom)
    const [pendingPromotion, setPendingPromotion] = useAtom(pendingPromotionAtom)

    // Read via refs inside the event listeners below instead of depending on
    // these atoms in the effect, so the listeners are attached once and
    // always see the latest values without being torn down and re-added.
    const pieceClickedRef = useRef(pieceClicked)
    const boardCoordinatesRef = useRef(boardCoordinates)
    const gameBoardRef = useRef(gameBoard)
    const currentTurnRef = useRef(currentTurn)
    const gameStatusRef = useRef(gameStatus)
    const pendingPromotionRef = useRef(pendingPromotion)
    useEffect(() => {
        pieceClickedRef.current = pieceClicked
        boardCoordinatesRef.current = boardCoordinates
        gameBoardRef.current = gameBoard
        currentTurnRef.current = currentTurn
        gameStatusRef.current = gameStatus
        pendingPromotionRef.current = pendingPromotion
    })

    useEffect(() => {
        if(!pieceRef.current ) return

        const piece = pieceRef.current

        const onMouseDown = (e: MouseEvent) => {
            if(isGameOver(gameStatusRef.current.state)) return
            if(pendingPromotionRef.current) return

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

                const capturedPiece = currentGameBoard[gameBoardCoordinates.y][gameBoardCoordinates.x].piece
                const newBoard = updateGameBoardWithMovedPiece(currentGameBoard, pieceClicked!, gameBoardCoordinates!)
                if(newBoard !== currentGameBoard) {
                    setGameBoard(newBoard)

                    const capturingColor = currentTurnRef.current
                    if(capturedPiece) {
                        setCapturedPieces(previous => ({
                            ...previous,
                            [capturingColor]: [...previous[capturingColor], capturedPiece],
                        }))
                    }

                    const movedPiece = newBoard[gameBoardCoordinates.y][gameBoardCoordinates.x].piece
                    if(movedPiece && isPawnPromotion(movedPiece, gameBoardCoordinates)) {
                        // Hold off on flipping the turn/status until the
                        // player picks a piece - PromotionPrompt finishes
                        // the move once that happens.
                        setPendingPromotion({color: capturingColor, coordinates: gameBoardCoordinates})
                    } else {
                        const nextTurn = capturingColor === "white" ? "black" : "white"
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
    }, [setPieceClicked, setValidMoves, setGameBoard, setCurrentTurn, setGameStatus, setBoardCoordinates, setCapturedPieces, setPendingPromotion])

    return(
        <div className="gamepiece" id={piece.id} ref={pieceRef}>
            <FontAwesomeIcon icon={getPieceIcon(piece.type)} id={piece.id} className={`chesspiece ${piece.color}piece`} />
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

    if(isCastlingMove(chessPiece, originalCoordinates, newCoordinates)) {
        const rookMove = getCastlingRookMove(newCoordinates.x)
        const rook = newGameBoard[originalCoordinates.y][rookMove.from].piece
        newGameBoard[originalCoordinates.y][rookMove.from] = {
            ...newGameBoard[originalCoordinates.y][rookMove.from],
            piece: null
        }
        newGameBoard[originalCoordinates.y][rookMove.to] = {
            ...newGameBoard[originalCoordinates.y][rookMove.to],
            piece: rook && {...rook, hasMoved: true}
        }
    }

    return newGameBoard
}
export default GamePiece