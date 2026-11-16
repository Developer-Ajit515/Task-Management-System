import axiosInstance from "../api/axiosInstance";

const getTasks = async (params = {}, role) => {
  const endpoint =
    role === "Admin"
      ? "/Tasks"
      : "/Tasks/my-tasks";

  const response = await axiosInstance.get(endpoint, {
    params,
  });

  return response.data;
};

export default {
  getTasks,
};