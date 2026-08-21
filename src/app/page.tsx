import { redirect } from "next/navigation";

/**
 * Home route — redirect straight to the To-Do List application.
 * The To-Do app lives at /todo (see src/app/todo/page.tsx).
 */
export default function Home() {
  redirect("/todo");
}
