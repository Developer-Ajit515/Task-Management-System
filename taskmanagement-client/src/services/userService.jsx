
import axiosInstance from "../api/axiosInstance";

const UserService = {
    // GET ALL USERS
    getAll: async () => {
        const response = await axiosInstance.get("/User");
        return response.data;
    },

    // GET USER BY ID
    getById: async (id) => {
        const response = await axiosInstance.get(`/User/${id}`);
        return response.data;
    },

    // CREATE EMPLOYEE
    createEmployee: async (userData) => {
        const response = await axiosInstance.post(
            "/Auth/create-employee",
            userData
        );
        return response.data;
    },

    // UPDATE USER
    update: async (id, userData) => {
        const response = await axiosInstance.put(
            `/User/${id}`,
            userData
        );
        return response.data;
    },

    // DEACTIVATE USER
    deactivate: async (id) => {
        const response = await axiosInstance.delete(`/User/${id}`);
        return response.data;
    }
};

export default UserService;
