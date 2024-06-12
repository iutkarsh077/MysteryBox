"use server";
import { sendMail } from "@/lib/SendMail";

interface SenditProps {
    to: string,
    name: string, 
    subject: string,
    body: string
}
const Sendit =async ({to, name, subject, body}: SenditProps) => {
    "use server";
    await sendMail({to, name, subject, body})
    return;
}

export default Sendit