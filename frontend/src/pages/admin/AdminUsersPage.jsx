import React, { useEffect, useState } from "react";
import { Users, Shield, UserX, UserCheck, ShieldAlert, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { adminApi } from "../../api/adminApi";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Badge } from "../../components/common/Badge";
import { Spinner } from "../../components/common/Spinner";
import { Pagination } from "../../components/common/Pagination";
import { formatDate } from "../../utils/formatters";

export function AdminUsersPage() {
  const { user: currentAdmin } = useAuth();
  const { showToast } = useToast();

  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const limit = 10;

  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await adminApi.listUsers({
        page,
        limit,
        role: roleFilter || undefined,
      });
      if (res.success) {
        setUsers(res.data || []);
        setTotal(res.pagination?.total || 0);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [page, roleFilter]);

  const handleToggleStatus = async (user) => {
    if (user.id === currentAdmin.id) {
      showToast("Security notice: Administrators cannot deactivate their own account.", "warning");
      return;
    }

    const action = user.is_active ? "deactivate" : "activate";
    if (!window.confirm(`Are you sure you want to ${action} user '${user.email}'?`)) {
      return;
    }

    setActionLoadingId(user.id);
    try {
      const res = await adminApi.updateUser(user.id, { isActive: !user.is_active });
      if (res.success) {
        showToast(`User account ${action}d successfully.`, "success");
        loadUsers();
      }
    } catch (err) {
      showToast(err.message || "Failed to update user status.", "error");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleToggleRole = async (user) => {
    const newRole = user.role === "ADMIN" ? "USER" : "ADMIN";
    if (user.id === currentAdmin.id && newRole === "USER") {
      showToast("Security notice: Administrators cannot demote their own account.", "warning");
      return;
    }

    if (!window.confirm(`Change role for '${user.email}' to ${newRole}?`)) {
      return;
    }

    setActionLoadingId(user.id);
    try {
      const res = await adminApi.updateUser(user.id, { role: newRole });
      if (res.success) {
        showToast(`User role updated to ${newRole}.`, "success");
        loadUsers();
      }
    } catch (err) {
      showToast(err.message || "Failed to update role.", "error");
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#6b21a8", fontWeight: 600, fontSize: "0.85rem" }}>
            <Link to="/admin" style={{ display: "flex", alignItems: "center", gap: "0.25rem", color: "var(--text-muted)" }}>
              <ArrowLeft size={14} /> Back to Admin Overview
            </Link>
          </div>
          <h1 style={{ fontSize: "1.85rem", fontWeight: 700, letterSpacing: "-0.02em", marginTop: "0.35rem" }}>
            Platform User Management
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.925rem" }}>
            Review institutional users, enforce access restrictions, and manage RBAC roles
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Filter Role:</span>
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
            className="form-select"
            style={{ width: "auto" }}
          >
            <option value="">All Roles</option>
            <option value="ADMIN">Administrators</option>
            <option value="USER">Researchers</option>
          </select>
        </div>
      </div>

      <Card>
        {loading ? (
          <div style={{ textAlign: "center", padding: "4rem" }}>
            <Spinner size="lg" label="Loading registered users..." />
          </div>
        ) : users.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>
            <Users size={36} style={{ margin: "0 auto 0.75rem", opacity: 0.4 }} />
            <p>No users found matching query.</p>
          </div>
        ) : (
          <>
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>User & Email</th>
                    <th>Organization</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Joined</th>
                    <th>Security Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{u.full_name}</div>
                        <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{u.email}</div>
                      </td>
                      <td style={{ fontSize: "0.85rem" }}>{u.organization || "Independent Researcher"}</td>
                      <td>
                        <Badge role={u.role} />
                      </td>
                      <td>
                        {u.is_active ? (
                          <span style={{ color: "#059669", fontWeight: 600, fontSize: "0.85rem" }}>
                            ● Active
                          </span>
                        ) : (
                          <span style={{ color: "#dc2626", fontWeight: 600, fontSize: "0.85rem" }}>
                            ● Deactivated
                          </span>
                        )}
                      </td>
                      <td style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                        {formatDate(u.created_at)}
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: "0.5rem" }}>
                          <Button
                            variant={u.is_active ? "secondary" : "primary"}
                            size="sm"
                            loading={actionLoadingId === u.id}
                            disabled={u.id === currentAdmin.id}
                            onClick={() => handleToggleStatus(u)}
                            icon={u.is_active ? UserX : UserCheck}
                          >
                            {u.is_active ? "Deactivate" : "Activate"}
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            disabled={u.id === currentAdmin.id}
                            onClick={() => handleToggleRole(u)}
                          >
                            {u.role === "ADMIN" ? "Demote" : "Promote"}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Pagination
              currentPage={page}
              totalPages={Math.ceil(total / limit)}
              onPageChange={setPage}
              totalItems={total}
              limit={limit}
            />
          </>
        )}
      </Card>
    </div>
  );
}

