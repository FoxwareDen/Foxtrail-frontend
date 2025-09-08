import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from './pages/LoginPage';
import Dashboard from "./pages/Dashboard";
import JobPrefrences from "./pages/JobPrefrences";
import Profile from "./pages/Profile";
function App() {


  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/dashboard" element= {<Dashboard />} />
          <Route path="/jobprefrences" element= {<JobPrefrences />} />
          <Route path="/profile" element= {<Profile />} />
        </Routes>

      </div>
    </Router>
  );
}

export default App;
