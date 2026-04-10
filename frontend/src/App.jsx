import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Feed from "./pages/Feed";
import Profile from "./pages/Profile";
import Graph from "./pages/Graph";
import Members from "./pages/Members";
import Navbar from "./components/Navbar";

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" />;
}

function Layout({ children }) {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/feed" element={
          <ProtectedRoute><Layout><Feed /></Layout></ProtectedRoute>
        } />

        <Route path="/profile" element={
          <ProtectedRoute><Layout><Profile /></Layout></ProtectedRoute>
        } />

        <Route path="/graph" element={
          <ProtectedRoute><Layout><Graph /></Layout></ProtectedRoute>
        } />

        <Route path="/members" element={
          <ProtectedRoute><Layout><Members /></Layout></ProtectedRoute>
        } />

        <Route path="*" element={<Navigate to="/login" />} />

      </Routes>
    </BrowserRouter>
  );
}