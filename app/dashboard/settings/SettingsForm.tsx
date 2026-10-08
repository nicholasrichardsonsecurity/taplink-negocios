"use client";

import { FormEvent, useState } from "react";

type Props = {
  csrf: string;
  name: string;
  email: string;
};

export default function SettingsForm({ csrf, name, email }: Props) {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");
    setSaving(true);

    const form = new FormData(event.currentTarget);
    const newPassword = String(form.get("newPassword") ?? "");
    const confirmPassword = String(form.get("confirmPassword") ?? "");

    if (newPassword && newPassword !== confirmPassword) {
      setError("As novas senhas não conferem.");
      setSaving(false);
      return;
    }

    const response = await fetch("/api/account/settings", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        csrf,
        name: form.get("name"),
        email: form.get("email"),
        currentPassword: form.get("currentPassword"),
        newPassword,
      }),
    });

    const result = await response.json().catch(() => null);

    if (!response.ok) {
      setError(result?.error ?? "Não foi possível salvar as alterações.");
      setSaving(false);
      return;
    }

    setMessage("Configurações salvas com sucesso.");
    setSaving(false);
  }

  return (
    <form className="settings-card" onSubmit={save}>
      <section>
        <small>INFORMAÇÕES DA CONTA</small>
        <h2>Seus dados</h2>

        <label>
          Nome completo
          <input name="name" defaultValue={name} required />
        </label>

        <label>
          E-mail
          <input name="email" type="email" defaultValue={email} required />
        </label>
      </section>

      <section>
        <small>SEGURANÇA</small>
        <h2>Alterar senha</h2>

        <label>
          Senha atual
          <input name="currentPassword" type="password" required />
        </label>

        <label>
          Nova senha
          <input name="newPassword" type="password" minLength={10} />
        </label>

        <label>
          Confirmar nova senha
          <input name="confirmPassword" type="password" minLength={10} />
        </label>
      </section>

      {error && <p className="form-error">{error}</p>}
      {message && <p className="form-success">{message}</p>}

      <button type="submit" className="primary-button" disabled={saving}>
        {saving ? "Salvando..." : "Salvar alterações"}
      </button>
    </form>
  );
}

