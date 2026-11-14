import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from "react-router-dom";

import Login from "./pages/login";
import Register from "./pages/register";
import Dashboard from "./pages/dashboard";
import CreateTask from "./pages/CreateTask";
import TaskList from "./pages/TaskList";
import TaskDetails from "./pages/TaskDetails";
import EditTask from "./pages/EditTask";
import UserList from "./pages/UserList";
import CreateEmployee from "./pages/CreateEmployee";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route path="/login" element={<Login />} />
        <Route path="/Register" element={<Register />} />

        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/Create-Task" element={<CreateTask />} />
        <Route path="/Tasks" element={<TaskList />} />
        
       <Route path="/Users" element={<UserList />} />
       <Route path="/Create-Employee" element={<CreateEmployee />} />
       <Route path="/Tasks/:id" element={<TaskDetails />} />

       <Route path="/Tasks/edit/:id" element={<EditTask />} />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;