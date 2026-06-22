import { useEffect } from "react";
import Login from "./screens/Login";
import Dashboard from "./screens/Dashboard";
import { useTclSession } from "./service/tcl/sessionStore";

const App = () => {
    // Backend-less path: "authenticated" === connected to TCL Cloud. On mount we
    // try to restore a persisted session (base token in localStorage) so a refresh
    // or revisit no longer forces a re-login.
    const status = useTclSession((state) => state.status);
    const restoring = useTclSession((state) => state.restoring);
    const init = useTclSession((state) => state.init);

    useEffect(() => {
        init();
    }, [init]);

    // While the token-based restore is in flight, show the boot loader instead of
    // flashing the login screen.
    if (restoring) {
        return (
            <div className="full-page-loader">
                <img src="/logo.png" alt="TCL Logo" />
            </div>
        );
    }

    // Single client-side gate: connected -> Dashboard, otherwise Login.
    return status === "connected" ? <Dashboard /> : <Login />;
};

export default App;
