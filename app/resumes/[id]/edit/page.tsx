// Trigger TS server reload
import { AuthGuard } from "@/components/auth-guard"
import ResumeEditorPage from "@/components/pages/resume/resume-editor"

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export const metadata = {
  title: "Edit Resume - Application Assistant",
  description: "Customize your professional resume dynamically.",
}

export default async function ResumeEditRoute({ params }: PageProps) {
  const { id } = await params

  return (
    <AuthGuard>
      <ResumeEditorPage id={id} />
    </AuthGuard>
  )
}
