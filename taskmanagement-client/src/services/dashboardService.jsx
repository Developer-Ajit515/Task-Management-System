
import axiosInstance from "../api/axiosInstance";

const getDashboardSummary = async () => {
  const response = await axiosInstance.get("/Dashboard/summary");

  return response.data.data;
};

const dashboardService = {
  getDashboardSummary,
};

export default dashboardService;
