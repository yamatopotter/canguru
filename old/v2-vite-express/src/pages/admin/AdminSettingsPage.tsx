import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { Layout } from '../../components/Layout';
import { Button } from '../../components/Button';
import { StatusMessage } from '../../components/StatusMessage';
import { ApiError } from '../../api/http';
import { fetchAdminSettings, updateAdminSettings, uploadLogo, type AdminSettings } from '../../api/admin';
import formStyles from '../../styles/form.module.css';
import styles from './AdminSettingsPage.module.css';

type LoadStatus = 'loading' | 'ready' | 'error';
type Feedback = { tone: 'success' | 'error'; message: string };

function errorMessage(err: unknown, fallback: string): string {
  return err instanceof ApiError ? err.message : fallback;
}

export function AdminSettingsPage() {
  const [settings, setSettings] = useState<AdminSettings | null>(null);
  const [status, setStatus] = useState<LoadStatus>('loading');
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  const [companyName, setCompanyName] = useState('');
  const [vuuptToken, setVuuptToken] = useState('');
  const [savingGeneral, setSavingGeneral] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchAdminSettings()
      .then((data) => {
        setSettings(data);
        setCompanyName(data.companyName);
        setStatus('ready');
      })
      .catch(() => setStatus('error'));
  }, []);

  async function handleSaveGeneral(event: FormEvent) {
    event.preventDefault();
    setSavingGeneral(true);
    setFeedback(null);
    try {
      const updated = await updateAdminSettings({
        companyName,
        vuuptApiToken: vuuptToken || undefined,
      });
      setSettings((prev) => (prev ? { ...prev, ...updated } : prev));
      setVuuptToken('');
      setFeedback({ tone: 'success', message: 'Configurações salvas.' });
    } catch (err) {
      setFeedback({ tone: 'error', message: errorMessage(err, 'Não foi possível salvar as configurações.') });
    } finally {
      setSavingGeneral(false);
    }
  }

  async function handleLogoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);
    setFeedback(null);
    try {
      const { logoUrl } = await uploadLogo(file);
      setSettings((prev) => (prev ? { ...prev, logoUrl } : prev));
      setFeedback({ tone: 'success', message: 'Logo atualizada.' });
    } catch (err) {
      setFeedback({ tone: 'error', message: errorMessage(err, 'Não foi possível enviar a logo.') });
    } finally {
      setUploadingLogo(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  return (
    <Layout>
      <div className={styles.container}>
        <h1 className={styles.title}>Configurações</h1>

        {feedback && <StatusMessage tone={feedback.tone}>{feedback.message}</StatusMessage>}

        {status === 'loading' && <StatusMessage tone="info">Carregando configurações...</StatusMessage>}
        {status === 'error' && (
          <StatusMessage tone="error">Não foi possível carregar as configurações. Atualize a página.</StatusMessage>
        )}

        {status === 'ready' && settings && (
          <>
            <section className={styles.card}>
              <h2 className={styles.cardTitle}>Logo da empresa</h2>
              <p className={styles.cardHint}>
                Aparece no cabeçalho do sistema e na tela de login. PNG, JPEG, WEBP ou SVG, até 2MB.
              </p>

              <div className={styles.logoRow}>
                <div className={styles.logoPreview}>
                  {settings.logoUrl ? (
                    <img src={settings.logoUrl} alt="Logo atual da empresa" />
                  ) : (
                    <span className={styles.logoPlaceholder}>Sem logo</span>
                  )}
                </div>

                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/svg+xml"
                    style={{ display: 'none' }}
                    onChange={handleLogoChange}
                    disabled={uploadingLogo}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    disabled={uploadingLogo}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {uploadingLogo ? 'Enviando...' : settings.logoUrl ? 'Trocar logo' : 'Enviar logo'}
                  </Button>
                </div>
              </div>
            </section>

            <form className={styles.card} onSubmit={handleSaveGeneral}>
              <h2 className={styles.cardTitle}>Empresa e integração</h2>

              <div className={formStyles.field}>
                <label className={formStyles.label} htmlFor="company-name">
                  Nome da empresa
                </label>
                <input
                  id="company-name"
                  className={formStyles.input}
                  value={companyName}
                  onChange={(event) => setCompanyName(event.target.value)}
                  required
                />
              </div>

              <div className={formStyles.field}>
                <label className={formStyles.label} htmlFor="vuupt-token">
                  Token da API da Vuupt
                </label>
                <input
                  id="vuupt-token"
                  className={formStyles.input}
                  type="password"
                  placeholder={settings.vuuptTokenConfigured ? settings.vuuptTokenMasked : 'Nenhum token configurado'}
                  value={vuuptToken}
                  onChange={(event) => setVuuptToken(event.target.value)}
                  autoComplete="off"
                />
                <span className={formStyles.hint}>
                  Deixe em branco para manter o token atual. O valor fica salvo apenas no servidor, nunca no
                  navegador.
                </span>
              </div>

              <div className={styles.formActions}>
                <Button type="submit" disabled={savingGeneral}>
                  {savingGeneral ? 'Salvando...' : 'Salvar'}
                </Button>
              </div>
            </form>
          </>
        )}
      </div>
    </Layout>
  );
}
