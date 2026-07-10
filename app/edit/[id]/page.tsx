"use client";

import { useParams } from "next/navigation";
import CreateWizard from "@/components/CreateWizard";

export default function EditPage() {
  const params = useParams();
  const id = params.id as string;
  return <CreateWizard mode="edit" editId={id} />;
}
