import { UsersTable } from "@/features/users/components/UsersTable";
import { Button } from "@/shared/components/ui/button";

export const UsersListPage = () => {
  return (
    <>
      <div className="flex justify-between mb-4">
        <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
          Users
        </h3>
        <div>
          <Button>Add User</Button>
        </div>
      </div>
      <UsersTable />
    </>
  );
}