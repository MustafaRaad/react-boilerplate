import { RolesTable } from "@/features/roles/components/RolesTable";

export function RolesListPage() {
  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-semibold">Roles</h1>
      </header>
      <RolesTable />
    </div>
  );
}
