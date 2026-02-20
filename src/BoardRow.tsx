import GamePiece from './GamePiece'
import { type Square } from './types/ChessObjects'

interface opts {
    row: Square[],
    rowIndex: number,
}

function BoardRow(props: opts) {
    const {row, rowIndex} = props

   return (
    <>
        { 
            row.map((gameSquare, index) =>
                <>
                    <div key={getSquareNumber(index, rowIndex).toString()} id={getSquareNumber(index, rowIndex).toString()} className={'gamesquare black ' + getColorClassName(index, rowIndex) }>
                        {gameSquare.piece &&
                            <GamePiece piece={gameSquare.piece} />
                        }
                    </div>      
                </>
            )
        }
    </>
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

export default BoardRow