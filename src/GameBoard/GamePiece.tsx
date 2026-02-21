import { type chessPiece, chessPieceType } from "../types/ChessObjects"
import { faChessBishop, faChessKing, faChessKnight, faChessPawn, faChessQueen, faChessRook } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useEffect, useRef } from "react"

interface opts {
    piece: chessPiece,
    isPieceClicked: boolean
    setPieceClicked: (bool: boolean) => void
}

function GamePiece(props: opts) {
    const {piece, isPieceClicked, setPieceClicked} = props

    const pieceRef = useRef<SVGSVGElement>(null)
    useRef(isPieceClicked)

    useEffect(() => {
        if(!pieceRef.current) return 

        const piece = pieceRef.current

        const onMouseDown = (e: MouseEvent) => { 
            setPieceClicked(true)
            console.log("Piece clicked")
            piece.style.top = `${e.clientY}px`
            piece.style.left = `${e.clientX}px`
        }

        const onMouseUp = (e: MouseEvent) => {
            setPieceClicked(false)
            console.log("Piece released")
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