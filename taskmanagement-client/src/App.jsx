import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/login";
import Register from "./pages/register";
import AdminDashboard from "./pages/AdminDashboard";
import Dashboard from "./pages/dashboard";
import CreateTask from "./pages/CreateTask";
import TaskList from "./pages/TaskList";
import TaskDetails from "./pages/TaskDetails";
import EditTask from "./pages/EditTask";
import UserList from "./pages/UserList";
import CreateEmployee from "./pages/CreateEmployee";


import ProtectedRoute from "./components/ProtectedRoute";

function App() {
    return (
        <BrowserRouter>
            <Routes>

                {/* Public Routes */}
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Routes accessible to all logged-in users */}
                <Route element={<ProtectedRoute />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/Tasks" element={<TaskList />} />
                    <Route path="/Tasks/:id" element={<TaskDetails />} />
                   

                </Route>

                {/* Admin Only Routes */}
                <Route element={<ProtectedRoute allowedRoles={["Admin"]} />}>
                    <Route path="/admin-dashboard" element={<AdminDashboard />} />
                    <Route path="/Create-Task" element={<CreateTask />} />
                    <Route path="/Tasks/edit/:id" element={<EditTask />} />
                    <Route path="/Users" element={<UserList />} />
                    <Route path="/Create-Employee" element={<CreateEmployee />} />
               </Route>

                {/* Unknown Route */}
                <Route path="*" element={<Navigate to="/login" replace />} />

            </Routes>
        </BrowserRouter>
    );
}

export default App;