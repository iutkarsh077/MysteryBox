"use server";
import { sendMail } from "@/lib/SendMail";
import { revalidatePath } from "next/cache";

interface SenditProps {
  to: string;
  name: string;
  subject: string;
  body: string;
}
console.log("In send it");

const Sendit = async ({ to, name, subject, body }: SenditProps) => {
  revalidatePath("/sign-up");
  await sendMail({ to, name, subject, body });
  return;
};

export default Sendit;
