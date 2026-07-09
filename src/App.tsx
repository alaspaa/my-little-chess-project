import { useAtomValue } from "jotai"
import GamePage from "./Chess/GamePage/GamePage"
import StartPage from "./StartPage/StartPage"
import Header from "./Header/Header"
import { currentPageAtom } from "./state"
import './App.css'

function App() {
  const currentPage = useAtomValue(currentPageAtom)

  return (
    <>
      <Header />
      <main className="app-content">
        {currentPage === "setup" ? <StartPage /> : <GamePage />}
      </main>
    </>
  )
}

export default App
