// App.jsx
import "./App.css";
import { Routes, Route, BrowserRouter } from "react-router-dom";  // Import BrowserRouter for routing
import UploadPage from './Pages/UploadPage';
import EntryPage from "./Pages/EntryPage";
import UserDetailsPage from "./Pages/UserDetailsPage";
import SettingsPage from "./Pages/SettingsPage";
import RetrievalPageDoc from "./Pages/RetrievalPageDoc";
import RetrievalPageDate from "./Pages/RetrievalPageDate";

function App() {
  return (
    <div className="App">
      {/* Wrap the Routes inside BrowserRouter and ChatProvider */}
      <BrowserRouter>
          <Routes>
            <Route path="/" element={<EntryPage />} />
            <Route path="/uploadDocs" element={<UploadPage />} />
            <Route path="/user-details" element={<UserDetailsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/retrievedoc" element={<RetrievalPageDoc />} />
            <Route path="/retrievedate" element={<RetrievalPageDate />} />
          </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
