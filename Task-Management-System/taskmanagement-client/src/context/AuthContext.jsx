
import {
    createContext,
    useContext,
    useState
} from "react";

import {
    loginUser,
    registerUser
} from "../services/authService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {

    const [user, setUser] = useState(null);

    const [token, setToken] = useState(
        () => localStorage.getItem("token")
    );

    // ==========================================
    // REGISTER
    // ==========================================
    const register = async (userData) => {

        try {

            const response = await registerUser(userData);

            return response;

        } catch (error) {

            console.error(
                "Registration Error:",
                error.response?.data || error.message
            );

            throw error;
        }
    };

    // ==========================================
    // LOGIN
    // ==========================================
    const login = async (credentials) => {

        try {

            const response = await loginUser(credentials);

            const authData = response.data;

            if (!authData || !authData.token) {
                throw new Error("Invalid login response.");
            }

            localStorage.setItem(
                "token",
                authData.token
            );

            setToken(authData.token);

            setUser({
                id: authData.userId,
                fullName: authData.fullName,
                email: authData.email,
                roles: authData.roles
            });

            return authData;

        } catch (error) {

            console.error(
                "Login Error:",
                error.response?.data || error.message
            );

            throw error;
        }
    };

    // ==========================================
    // LOGOUT
    // ==========================================
    const logout = () => {

        localStorage.removeItem("token");

        setToken(null);

        setUser(null);
    };

    // ==========================================
    // CONTEXT PROVIDER
    // ==========================================
    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                register,
                login,
                logout,
                isAuthenticated: !!token
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

// ==========================================
// CUSTOM HOOK
// ==========================================
export const useAuth = () => {

    const context = useContext(AuthContext);

    if (!context) {
        throw new Error(
            "useAuth must be used inside AuthProvider"
        );
    }

    return context;
};
