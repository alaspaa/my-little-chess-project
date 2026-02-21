import { type chessPiece, chessPieceType } from "../types/ChessObjects"
import { faChessBishop, faChessKing, faChessKnight, faChessPawn, faChessQueen, faChessRook } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useEffect, useRef } from "react"

interface opts {
    piece: chessPiece,
}

function GamePiece(props: opts) {
    const {piece} = props

    const pieceRef = useRef<SVGSVGElement>(null)
    const isClicked = useRef(false)

    useEffect(() => {
        if(!pieceRef.current) return 

        const piece = pieceRef.current

        const onMouseDown = (e: MouseEvent) => {
            isClicked.current = true
        }

        const onMouseUp = (e: MouseEvent) => {
            isClicked.current = false
        }

        piece.addEventListener('mousedown', onMouseDown)

        piece.addEventListener('mouseup', onMouseUp)

        const cleanup = () => {
            piece.removeEventListener('mousedown', onMouseDown)
            piece.removeEventListener('mouseup', onMouseUp)
        }
        
        return cleanup
    }, [piece])

    switch(piece.type) {
        case chessPieceType.PAWN:
            return (<FontAwesomeIcon icon={faChessPawn} className={`chesspiece ${piece.color}piece` } ref={pieceRef}/>);
            
        case chessPieceType.ROOK:
            return(<FontAwesomeIcon icon={faChessRook} className={`chesspiece ${piece.color}piece` } ref={pieceRef}/>)
            
        case chessPieceType.KNIGHT:
            return(<FontAwesomeIcon icon={faChessKnight} className={`chesspiece ${piece.color}piece` } ref={pieceRef}/>)
        
        case chessPieceType.BISHOP:
            return(<FontAwesomeIcon icon={faChessBishop} className={`chesspiece ${piece.color}piece` } ref={pieceRef}/>)
            
        case chessPieceType.KING:
            return(<FontAwesomeIcon icon={faChessKing} className={`chesspiece ${piece.color}piece` } ref={pieceRef}/>)
            
        case chessPieceType.QUEEN:
            return(<FontAwesomeIcon icon={faChessQueen} className={`chesspiece ${piece.color}piece` } ref={pieceRef}/>)
    }
}

export default GamePiece