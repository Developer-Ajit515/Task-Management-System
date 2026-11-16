
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

const getUserFromToken = (token) => {
    if (!token) return null;

    try {
        const payload = token.split(".")[1];

        const base64 = payload
            .replace(/-/g, "+")
            .replace(/_/g, "/");

        const bytes = Uint8Array.from(
            atob(base64),
            c => c.charCodeAt(0)
        );

        const claims = JSON.parse(
            new TextDecoder().decode(bytes)
        );

        const roleClaim =
            "http://schemas.microsoft.com/ws/2008/06/identity/claims/role";

        const nameIdClaim =
            "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier";

        const roles =
            claims[roleClaim] ||
            claims.role ||
            claims.roles ||
            [];

        return {
            id: claims[nameIdClaim] || claims.sub,
            fullName:
                claims.name ||
                claims["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] ||
                "",
            email:
                claims.email ||
                claims["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"] ||
                "",
            roles: Array.isArray(roles) ? roles : [roles]
        };

    } catch (error) {
        console.error("JWT parsing error:", error);
        return null;
    }
};

export const AuthProvider = ({ children }) => {

    const [token, setToken] = useState(
        () => localStorage.getItem("token")
    );

    const [user, setUser] = useState(() =>
        getUserFromToken(localStorage.getItem("token"))
    );

    const register = async (userData) => {
        return await registerUser(userData);
    };

    const login = async (credentials) => {

        // loginUser already returns response.data
        const response = await loginUser(credentials);

        // AuthController wraps AuthResponseDto inside data
        const authData = response.data;

        if (!authData?.token) {
            throw new Error("JWT token not found.");
        }

        // Store access token
        localStorage.setItem("token", authData.token);

        // Store refresh token
        localStorage.setItem(
            "refreshToken",
            authData.refreshToken
        );

        setToken(authData.token);

        const tokenUser = getUserFromToken(authData.token);

        // Prefer API roles
        const roles = authData.roles || tokenUser?.roles || [];

        const loggedInUser = {
            id: authData.userId ?? tokenUser?.id,
            fullName: authData.fullName ?? tokenUser?.fullName,
            email: authData.email ?? tokenUser?.email,
            roles: Array.isArray(roles) ? roles : [roles]
        };

        setUser(loggedInUser);

        return {
            ...authData,
            roles: loggedInUser.roles
        };
    };

    const logout = () => {

        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");

        setToken(null);
        setUser(null);
    };

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

export const useAuth = () => {

    const context = useContext(AuthContext);

    if (!context) {
        throw new Error(
            "useAuth must be used inside AuthProvider"
        );
    }

    return context;
};
