import type { BoardCoordinates, ChessPiece, Square } from "./ChessObjects";


function validateMove(
    gameBoard: Square[][], 
    currentCoordinates: BoardCoordinates, 
    newCoordinates: BoardCoordinates, 
    piece: ChessPiece
): boolean {  
    switch(piece.type) {
        case "PAWN":
            return validatePawnMove(gameBoard, currentCoordinates, newCoordinates, piece)
        case "ROOK":
            return validateRookMove(gameBoard, currentCoordinates, newCoordinates, piece)
        case "KNIGHT":
            return validateKnightMove(gameBoard, currentCoordinates, newCoordinates, piece)
        case "BISHOP":
            return validateBishopMove(gameBoard, currentCoordinates, newCoordinates, piece)
        case "QUEEN":
            return validateQueenMove(gameBoard, currentCoordinates, newCoordinates, piece)
        case "KING":
            return validateKingMove(gameBoard, currentCoordinates, newCoordinates, piece)
        default:            
            return false
    }
}

function validatePawnMove(gameBoard: Square[][], currentCoordinates: BoardCoordinates, newCoordinates: BoardCoordinates, piece: ChessPiece): boolean {
    // first rule: pawns can only move forward (white moves down, black moves up)
    if(piece.color === "white" && newCoordinates.y <= currentCoordinates.y) {
        return false
    }
    if(piece.color === "black" && newCoordinates.y >= currentCoordinates.y) {
        return false
    }

    // second rule: pawns can only move 1 square forward, except on their first move when they can move 2 squares forward
    if(piece.hasMoved && (newCoordinates.y - currentCoordinates.y) > 1) {
        return false
    }
    if(!piece.hasMoved && (newCoordinates.y - currentCoordinates.y) > 2) {
        return false
    }

    // fourth rule: pawns can only move diagonally when capturing a piece
    if(newCoordinates.x !== currentCoordinates.x) {
        if(Math.abs(newCoordinates.x - currentCoordinates.x) !== 1) {
            return false
        }
        if(!gameBoard[newCoordinates.y][newCoordinates.x].piece || gameBoard[newCoordinates.y][newCoordinates.x].piece?.color === piece.color) {
            return false
        }
    } else {
        if(gameBoard[newCoordinates.y][newCoordinates.x].piece) {
            return false
        }
    }

    return true
}

function validateRookMove(gameBoard: Square[][], currentCoordinates: BoardCoordinates, newCoordinates: BoardCoordinates, piece: ChessPiece): boolean {
    // first rule: rooks can only move in straight lines (horizontally or vertically)
    if(newCoordinates.x !== currentCoordinates.x && newCoordinates.y !== currentCoordinates.y) {
        return false
    }
    
    // second rule: rooks cannot jump over other pieces
    if(newCoordinates.x === currentCoordinates.x) {
        const minY = Math.min(newCoordinates.y, currentCoordinates.y)
        const maxY = Math.max(newCoordinates.y, currentCoordinates.y)
        for(let y = minY + 1; y < maxY; y++) {
            if(gameBoard[y][newCoordinates.x].piece) {
                return false
            }
        }
    } else {
        const minX = Math.min(newCoordinates.x, currentCoordinates.x)
        const maxX = Math.max(newCoordinates.x, currentCoordinates.x)
        for(let x = minX + 1; x < maxX; x++) {
            if(gameBoard[newCoordinates.y][x].piece) {
                return false
            }
        }
    }

    //third rule: rooks cannot capture pieces of the same color
    if(gameBoard[newCoordinates.y][newCoordinates.x].piece && gameBoard[newCoordinates.y][newCoordinates.x].piece?.color === piece.color) {
        return false
    }

    return true
}

function validateKnightMove(gameBoard: Square[][], currentCoordinates: BoardCoordinates, newCoordinates: BoardCoordinates, piece: ChessPiece): boolean {
    //first rule knight can only move 2 + 1 squares at a time
    const moveVertical = Math.abs(newCoordinates.y - currentCoordinates.y) === 2 && Math.abs(newCoordinates.x - currentCoordinates.x)
    const moveHorizontal = Math.abs(newCoordinates.x - currentCoordinates.x) === 2 && Math.abs(newCoordinates.y - currentCoordinates.y)
    if(!moveVertical && !moveHorizontal) {
        return false
    }

    //second rule knight cannot capture pieces of the same color
    if(gameBoard[newCoordinates.y][newCoordinates.x].piece && gameBoard[newCoordinates.y][newCoordinates.x].piece?.color === piece.color) {
        return false
    }

    return true
}

function validateBishopMove(gameBoard: Square[][], currentCoordinates: BoardCoordinates, newCoordinates: BoardCoordinates, piece: ChessPiece): boolean {
    // first rule: bishops can only move diagonally
    if(Math.abs(newCoordinates.x - currentCoordinates.x) !== Math.abs(newCoordinates.y - currentCoordinates.y)) {
        return false
    }

    // second rule: bishops cannot jump over other pieces
    const xDirection = newCoordinates.x > currentCoordinates.x ? 1 : -1
    const yDirection = newCoordinates.y > currentCoordinates.y ? 1 : -1
    let x = currentCoordinates.x + xDirection
    let y = currentCoordinates.y + yDirection
    while(x !== newCoordinates.x && y !== newCoordinates.y) {
        if(gameBoard[y][x].piece) {
            return false
        }
        x += xDirection
        y += yDirection
    }

    // third rule: bishops cannot capture pieces of the same color
    if(gameBoard[newCoordinates.y][newCoordinates.x].piece && gameBoard[newCoordinates.y][newCoordinates.x].piece?.color === piece.color) {
        return false
    }

    return true
}

function validateQueenMove(gameBoard: Square[][], currentCoordinates: BoardCoordinates, newCoordinates: BoardCoordinates, piece: ChessPiece): boolean {
    
    return true
}

function validateKingMove(gameBoard: Square[][], currentCoordinates: BoardCoordinates, newCoordinates: BoardCoordinates, piece: ChessPiece): boolean {
    // first rule: kings can only move one square in any direction
    if(Math.abs(newCoordinates.x - currentCoordinates.x) > 1 || Math.abs(newCoordinates.y - currentCoordinates.y) > 1) {
        return false
    }

    // second rule: kings cannot move to a square occupied by a piece of the same color
    if(gameBoard[newCoordinates.y][newCoordinates.x].piece && gameBoard[newCoordinates.y][newCoordinates.x].piece?.color === piece.color) {
        return false
    }

    return true
}

export default validateMove