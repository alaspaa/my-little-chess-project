import { type BoardCoordinates, type ChessPiece, type Square } from "../types/ChessObjects"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useEffect, useRef } from "react"
import { capturedPiecesAtom, currentTurnAtom, enPassantTargetAtom, gameBoardAtom, gameStatusAtom, isGameOver, pendingPromotionAtom, pieceClickedAtom, positionHistoryAtom, threefoldRepetitionEnabledAtom, validMovesAtom } from "../../state"
import { useAtom } from "jotai"
import { boardCoordinatesAtom } from "../../state"
import validateMove, { getLegalMoves, isCheckmate, isKingInCheck, isThreefoldRepetition } from "../GameLogic/GameLogicValidator"
import { getCastlingRookMove, getEnPassantCapturedPawnCoordinates, getPawnDoubleStepTarget, isCastlingMove, isEnPassantMove, isPawnPromotion } from "../GameLogic/MoveResolver"
import { serializePosition } from "../GameLogic/Position"
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
    const [positionHistory, setPositionHistory] = useAtom(positionHistoryAtom)
    const [threefoldRepetitionEnabled] = useAtom(threefoldRepetitionEnabledAtom)
    const [enPassantTarget, setEnPassantTarget] = useAtom(enPassantTargetAtom)

    // Read via refs inside the event listeners below instead of depending on
    // these atoms in the effect, so the listeners are attached once and
    // always see the latest values without being torn down and re-added.
    const pieceClickedRef = useRef(pieceClicked)
    const boardCoordinatesRef = useRef(boardCoordinates)
    const gameBoardRef = useRef(gameBoard)
    const currentTurnRef = useRef(currentTurn)
    const gameStatusRef = useRef(gameStatus)
    const pendingPromotionRef = useRef(pendingPromotion)
    const positionHistoryRef = useRef(positionHistory)
    const threefoldRepetitionEnabledRef = useRef(threefoldRepetitionEnabled)
    const enPassantTargetRef = useRef(enPassantTarget)
    useEffect(() => {
        pieceClickedRef.current = pieceClicked
        boardCoordinatesRef.current = boardCoordinates
        gameBoardRef.current = gameBoard
        currentTurnRef.current = currentTurn
        gameStatusRef.current = gameStatus
        pendingPromotionRef.current = pendingPromotion
        positionHistoryRef.current = positionHistory
        threefoldRepetitionEnabledRef.current = threefoldRepetitionEnabled
        enPassantTargetRef.current = enPassantTarget
    })

    useEffect(() => {
        if(!pieceRef.current ) return

        const piece = pieceRef.current

        const onPointerDown = (e: PointerEvent) => {
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
            setValidMoves(getLegalMoves(currentGameBoard, currentCoordinates, clickedPiece, enPassantTargetRef.current))
        }

        const onPointerUp = () => {
            const boardCoordinates = boardCoordinatesRef.current
            const pieceClicked = pieceClickedRef.current

            // No pointermove means no drag - nothing to drop onto.
            if(boardCoordinates) {
                const gameSquare = document.elementsFromPoint(boardCoordinates.x, boardCoordinates.y)
                .find(el => {
                    return el instanceof HTMLElement && el.classList.contains('gamesquare')
                })

                const currentGameBoard = gameBoardRef.current
                const currentEnPassantTarget = enPassantTargetRef.current

                const gameBoardCoordinates = getGameBoardCoordinatesFromGameSquare(gameSquare)
                if(gameBoardCoordinates && pieceClicked) {

                    const originalCoordinates = findPieceCoordinates(currentGameBoard, pieceClicked)
                    const movingPiece = originalCoordinates && currentGameBoard[originalCoordinates.y][originalCoordinates.x].piece

                    let capturedPieceCoordinates = gameBoardCoordinates
                    if(movingPiece && originalCoordinates && isEnPassantMove(movingPiece, gameBoardCoordinates, currentEnPassantTarget)) {
                        capturedPieceCoordinates = getEnPassantCapturedPawnCoordinates(originalCoordinates, gameBoardCoordinates)
                    }
                    const capturedPiece = currentGameBoard[capturedPieceCoordinates.y][capturedPieceCoordinates.x].piece

                    const newBoard = updateGameBoardWithMovedPiece(currentGameBoard, pieceClicked, gameBoardCoordinates, currentEnPassantTarget)
                    if(newBoard !== currentGameBoard) {
                        setGameBoard(newBoard)

                        const capturingColor = currentTurnRef.current
                        if(capturedPiece) {
                            setCapturedPieces(previous => ({
                                ...previous,
                                [capturingColor]: [...previous[capturingColor], capturedPiece],
                            }))
                        }

                        const nextEnPassantTarget = movingPiece && originalCoordinates
                            ? getPawnDoubleStepTarget(movingPiece, originalCoordinates, gameBoardCoordinates)
                            : null
                        setEnPassantTarget(nextEnPassantTarget)

                        const movedPiece = newBoard[gameBoardCoordinates.y][gameBoardCoordinates.x].piece
                        if(movedPiece && isPawnPromotion(movedPiece, gameBoardCoordinates)) {
                            // Hold off on flipping the turn/status until the
                            // player picks a piece - PromotionPrompt finishes
                            // the move once that happens.
                            setPendingPromotion({color: capturingColor, coordinates: gameBoardCoordinates})
                        } else {
                            const nextTurn = capturingColor === "white" ? "black" : "white"
                            setCurrentTurn(nextTurn)

                            const position = serializePosition(newBoard, nextTurn)
                            const newPositionHistory = [...positionHistoryRef.current, position]
                            setPositionHistory(newPositionHistory)

                            if(isCheckmate(newBoard, nextTurn, nextEnPassantTarget)) {
                                setGameStatus({state: "checkmate", color: nextTurn})
                            } else if(threefoldRepetitionEnabledRef.current && isThreefoldRepetition(newPositionHistory, position)) {
                                setGameStatus({state: "draw", color: null})
                            } else if(isKingInCheck(newBoard, nextTurn)) {
                                setGameStatus({state: "check", color: nextTurn})
                            } else {
                                setGameStatus({state: "playing", color: null})
                            }
                        }
                    }
                }
            }

            if(pieceClicked) {
                const piece = (document.getElementById(pieceClicked) as HTMLElement).firstChild as HTMLElement
                if(piece) {
                    piece.style.removeProperty('position')
                    piece.style.removeProperty('top')
                    piece.style.removeProperty('left')
                }
            }

            setBoardCoordinates(null)
            setPieceClicked(null)
            setValidMoves([])
        }

        piece.addEventListener('pointerdown', onPointerDown)

        piece.addEventListener('pointerup', onPointerUp)

        const cleanup = () => {
            piece.removeEventListener('pointerdown', onPointerDown)
            piece.removeEventListener('pointerup', onPointerUp)
        }

        return cleanup
    }, [setPieceClicked, setValidMoves, setGameBoard, setCurrentTurn, setGameStatus, setBoardCoordinates, setCapturedPieces, setPendingPromotion, setPositionHistory, setEnPassantTarget])

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

function updateGameBoardWithMovedPiece(
    gameBoard: Square[][],
    pieceId: string,
    newCoordinates: BoardCoordinates,
    enPassantTarget: BoardCoordinates | null
): Square[][] {
    const originalCoordinates = findPieceCoordinates(gameBoard, pieceId)
    const piece = originalCoordinates && gameBoard[originalCoordinates.y][originalCoordinates.x].piece

    if(!piece || !originalCoordinates) return gameBoard

    const newBoard = gameBoard.map(row => row.map(square =>
        square.piece?.id === pieceId ? {...square, piece: null} : square
    ))

    return validateAndUpdateGameBoardWithMovedPiece(gameBoard, newBoard, originalCoordinates, newCoordinates, piece, enPassantTarget)
}

function validateAndUpdateGameBoardWithMovedPiece(
    currentGameBoard: Square[][],
    newGameBoard: Square[][],
    originalCoordinates: BoardCoordinates,
    newCoordinates: BoardCoordinates,
    chessPiece: ChessPiece,
    enPassantTarget: BoardCoordinates | null,
): Square[][] {
 if(!validateMove(currentGameBoard, originalCoordinates, newCoordinates, chessPiece, enPassantTarget)) return currentGameBoard


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

    if(isEnPassantMove(chessPiece, newCoordinates, enPassantTarget)) {
        const capturedPawnCoordinates = getEnPassantCapturedPawnCoordinates(originalCoordinates, newCoordinates)
        newGameBoard[capturedPawnCoordinates.y][capturedPawnCoordinates.x] = {
            ...newGameBoard[capturedPawnCoordinates.y][capturedPawnCoordinates.x],
            piece: null
        }
    }

    return newGameBoard
}
export default GamePiece