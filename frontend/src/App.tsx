import Login from "./screens/Login";
import Dashboard from "./screens/Dashboard";
import { useTclSession } from "./service/tcl/sessionStore";

const App = () => {
    // Backend-less path: "authenticated" === connected to TCL Cloud with the
    // user's real credentials. Session is in-memory, so a refresh returns here.
    const status = useTclSession((state) => state.status);

    // Single client-side gate: connected -> Dashboard, otherwise Login.
    return status === "connected" ? <Dashboard /> : <Login />;
};

export default App;
