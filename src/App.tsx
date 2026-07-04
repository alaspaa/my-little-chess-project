import { useAtomValue } from "jotai"
import GamePage from "./GamePage/GamePage"
import StartPage from "./StartPage/StartPage"
import { currentPageAtom } from "./state"
import './App.css'

function App() {
  const currentPage = useAtomValue(currentPageAtom)

  return (
    currentPage === "setup" ? <StartPage /> : <GamePage />
  )
}

export default App
