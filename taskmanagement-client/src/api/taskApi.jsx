
import axiosInstance from "./axiosInstance";

export const updateTaskStatus = async (id, status) => {
  const response = await axiosInstance.patch(
    `/Tasks/${id}/status`,
    { status }
  );

  return response.data;
};

export const updateTask = async (id, taskData) => {
  const response = await axiosInstance.put(
    `/Tasks/${id}`,
    taskData
  );

  return response.data;
};
