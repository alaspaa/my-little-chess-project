import { useAtomValue } from "jotai"
import GameBoard from "./GameBoard/GameBoard"
import StartPage from "./StartPage/StartPage"
import { currentPageAtom } from "./state"
import './App.css'

function App() {
  const currentPage = useAtomValue(currentPageAtom)

  return (
    currentPage === "setup" ? <StartPage /> : <GameBoard />
  )
}

export default App
