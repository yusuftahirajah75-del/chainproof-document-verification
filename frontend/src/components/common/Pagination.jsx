import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./Button";

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  limit,
}) {
  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * limit + 1;
  const endItem = Math.min(currentPage * limit, totalItems);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "1rem 0 0.5rem",
        fontSize: "0.875rem",
        color: "var(--text-muted)",
      }}
    >
      <div>
        Showing <strong style={{ color: "var(--text-main)" }}>{startItem}</strong> to{" "}
        <strong style={{ color: "var(--text-main)" }}>{endItem}</strong> of{" "}
        <strong style={{ color: "var(--text-main)" }}>{totalItems}</strong> entries
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <Button
          variant="secondary"
          size="sm"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          icon={ChevronLeft}
        >
          Previous
        </Button>

        <span style={{ padding: "0 0.5rem", fontWeight: 500, color: "var(--text-main)" }}>
          Page {currentPage} of {totalPages}
        </span>

        <Button
          variant="secondary"
          size="sm"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          style={{ flexDirection: "row-reverse" }}
          icon={ChevronRight}
        >
          Next
        </Button>
      </div>
    </div>
  );
}

