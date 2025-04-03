import React from "react";
import { DataTable } from "@/components/tables/data-table"; // Import your DataTable component
import { Button } from "@/components/ui/button";

type User = {
  id: string;
  username: string;
  tier: string;
};

const columns = [
  {
    header: "Username",
    accessorKey: "username",
  },
  {
    header: "Tier",
    accessorKey: "tier",
  },
  {
    header: "Actions",
    cell: ({ row }: { row: { original: User } }) => {
      const user = row.original;
      return (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleEdit(user.id)}
          >
            Edit
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => handleDelete(user.id)}
          >
            Delete
          </Button>
        </div>
      );
    },
  },
];

const handleEdit = (id: string) => {
  console.log("Edit user with id:", id);
  // Implement edit functionality (e.g., navigate to edit page or open a modal)
};

const handleDelete = (id: string) => {
  console.log("Delete user with id:", id);
  // Implement delete functionality (e.g., confirm deletion, call API, etc.)
};

const data: User[] = [
  { id: "1", username: "user1", tier: "Gold" },
  { id: "2", username: "user2", tier: "Platinum" },
  { id: "3", username: "user3", tier: "Gold" },
];

export default function OperatorManageCommission() {
  return (
    <div className="p-4">
      <DataTable columns={columns} data={data} />
    </div>
  );
}
