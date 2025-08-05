// App.jsx
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import WhiteBoard from './pages/whiteBoard';
import HomePage from './pages/home';
import AuthPage from './pages/AuthPage';
import CodeEditor from './pages/Editor';
import Error404Page from './pages/ErrorPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/whiteboard" element={<WhiteBoard />} />
        <Route path="/Auth" element={<AuthPage />} />
        <Route path="/editor" element={<CodeEditor />} />
        <Route path="*" element={<Error404Page />} />
        
      </Routes>
    </Router>
  );
}

export default App;
