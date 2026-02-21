import GamePiece from './GamePiece'
import { type Square } from '../types/ChessObjects'
import { useRef, useEffect } from 'react'

interface opts {
    gameSquare: Square,
    rowIndex: number,
    columnIndex: number,
    setPieceClicked: (bool: boolean) => void
    isPieceClicked: boolean
}

function GameSquare(props: opts) {
    const {gameSquare, rowIndex, columnIndex, setPieceClicked, isPieceClicked} = props
    
        const hoveredSquare = useRef<HTMLDivElement>(null)
    
        useEffect(() => {
            if(!hoveredSquare.current) return
    
            const square = hoveredSquare.current
    
            const onHover = (e: MouseEvent) => {
                if(e.target instanceof HTMLElement ) {
                    const piece = e.target.childNodes[0] as SVGSVGElement
                    if(piece) {
                        console.log("Hovering over piece")
                        console.log(isPieceClicked)
                        console.log(piece)
                    } else {
                        console.log("Hovering over square")
                    }    
                }
                console.log()
/*
                if(e.target instanceof HTMLElement) {
                    const coords = getBoardCoordinates(parseInt(e.target.id))
                    console.log(coords)
                } else if(e.target instanceof SVGSVGElement) {
                    const id = e.target.parentNode instanceof HTMLElement ? e.target.parentNode.id : "No id"
                    const coords = getBoardCoordinates(parseInt(id))
                    console.log(coords)
                }*/
            }
    
            square.addEventListener('mouseenter', onHover)
      
            const cleanup = () => {
                square.removeEventListener('mouseenter', onHover)
            }
    
            return cleanup
    
        }, [])


    return (
        <div 
            key={getSquareNumber(columnIndex, rowIndex).toString()} 
            id={getSquareNumber(columnIndex, rowIndex).toString()} 
            className={'gamesquare black ' + getColorClassName(columnIndex, rowIndex) }
            ref={hoveredSquare}
        >
            {gameSquare.piece &&
                <GamePiece 
                    piece={gameSquare.piece} 
                    isPieceClicked={isPieceClicked} 
                    setPieceClicked={setPieceClicked}
                />
            }
        </div>
    )
}

function getSquareNumber(index: number, rowIndex: number): number {
        return (index+1) + (rowIndex * 8)
    }

function isBlack(index: number, rowIndex: number): boolean {
    if((rowIndex + 1) % 2 == 0) {
        return (index + 1) % 2 != 0
    } else {
        return (index + 1) % 2 == 0
    }
}

function getColorClassName(index: number, rowIndex: number): string {
    return isBlack(index, rowIndex) ? 'black' : 'white'
}

function getBoardCoordinates(squareNumber: number): {x: number, y: number} {
    const x = (squareNumber - 1) % 8
    const y = Math.floor((squareNumber - 1) / 8)
    return {x, y}
}

export default GameSquare