import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import { useTclSession } from "./service/tcl/sessionStore";

const App = () => {
    // Backend-less path: "authenticated" === connected to TCL Cloud with the
    // user's real credentials. Session is in-memory, so a refresh returns here.
    const status = useTclSession((state) => state.status);

    // If not connected to TCL, show login page for all routes
    if (status !== "connected") {
        return <Login />;
    }

    // If authenticated, show routes
    return (
        <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
    );
};

export default App;

