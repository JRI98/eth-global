import logo from "./logo.svg";
import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import GovernancePage from "./views/GovernancePage";
import LandingPage from "./views/LandingPage";
import MintingPage from "./views/MintingPage";
import Header from "./components/Header";
import { ThemeProvider } from "./ThemeProvider";

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Header />

        <Routes>
          <Route element={<LandingPage />} path="/"></Route>
          <Route element={<GovernancePage />} path="/governance"></Route>
          <Route element={<MintingPage />} path="/mint"></Route>
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
