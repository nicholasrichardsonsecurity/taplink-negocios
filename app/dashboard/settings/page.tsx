import { requireSession } from "@/lib/auth/session";
import { csrfToken } from "@/lib/security";
import SettingsForm from "./SettingsForm";

export default async function SettingsPage() {
  const session = await requireSession();

  return (
    <main className="dashboard-page settings-page">
      <div className="page-heading">
        <small>CONTA</small>
        <h1>Configurações</h1>
        <p>Atualize seus dados de acesso e informações pessoais.</p>
      </div>

      <SettingsForm
        csrf={csrfToken(session.sessionTokenHash)}
        name={session.userName}
        email={session.email}
      />
    </main>
  );
}

