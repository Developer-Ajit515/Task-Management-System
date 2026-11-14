import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {

    const { token, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <nav className="navbar navbar-dark bg-dark px-4">

            <Link to="/dashboard" className="navbar-brand">
                Task Management
            </Link>

            {token && (
                <button
                    className="btn btn-danger"
                    onClick={handleLogout}
                >
                    Logout
                </button>
            )}

        </nav>
    );
}

export default Navbar;