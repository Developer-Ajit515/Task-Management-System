
import axiosInstance from "../api/axiosInstance";

// ==========================================
// REGISTER USER
// ==========================================
export const registerUser = async (userData) => {
    const response = await axiosInstance.post(
        "/Auth/register",
        {
            fullName: userData.fullName.trim(),
            email: userData.email.trim(),
            password: userData.password
        }
    );

    return response.data;
};

// ==========================================
// LOGIN USER
// ==========================================
export const loginUser = async (credentials) => {
    const response = await axiosInstance.post(
        "/Auth/login",
        {
            email: credentials.email.trim(),
            password: credentials.password
        }
    );

    return response.data;
};
