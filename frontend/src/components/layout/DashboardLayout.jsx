import React from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "../common/Sidebar";

export function DashboardLayout() {
  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-main">
        <main className="dashboard-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

