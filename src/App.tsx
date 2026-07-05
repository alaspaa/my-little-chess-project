import { useAtomValue } from "jotai"
import GamePage from "./GamePage/GamePage"
import StartPage from "./StartPage/StartPage"
import Header from "./Header/Header"
import { currentPageAtom } from "./state"
import './App.css'

function App() {
  const currentPage = useAtomValue(currentPageAtom)

  return (
    <>
      <Header />
      {currentPage === "setup" ? <StartPage /> : <GamePage />}
    </>
  )
}

export default App
