export const dynamic = "force-dynamic";
export const revalidate = 0;
import UserDashboard from "@/components/UserDashBoard";
import {  cookies } from "next/headers";
const Dashboard = async () => {
  cookies();
  return (
    <>
      <UserDashboard />
    </>
  );
};

export default Dashboard;
