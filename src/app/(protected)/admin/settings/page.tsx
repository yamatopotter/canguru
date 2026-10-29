import { getSetting, maskToken, SETTING_KEYS, parseLabelMargin, DEFAULT_LABEL_MARGIN_X_MM } from '@/lib/settings';
import { getVuuptTokenStatus } from '@/lib/vuupt';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogoUploadForm } from './LogoUploadForm';
import { SettingsForm } from './SettingsForm';
import { LabelSettingsForm } from './LabelSettingsForm';
import { SmtpSettingsForm } from './SmtpSettingsForm';
import { VuuptStatusCard } from './VuuptStatusCard';
import { ZohoSettingsForm } from './ZohoSettingsForm';

export default async function AdminSettingsPage() {
  const [
    companyName,
    logoUrl,
    vuuptToken,
    smtpHost,
    smtpPort,
    smtpSecure,
    smtpUser,
    smtpFrom,
    vuuptStatus,
    zohoClientId,
    zohoClientSecret,
    zohoRedirectUri,
    zohoAccountsBaseUrl,
    paymentOptionsEnabled,
    signatureEnabled,
    marginTop,
    marginBottom,
    marginLeft,
    marginRight,
  ] = await Promise.all([
    getSetting(SETTING_KEYS.companyName),
    getSetting(SETTING_KEYS.companyLogoPath),
    getSetting(SETTING_KEYS.vuuptApiToken),
    getSetting(SETTING_KEYS.smtpHost),
    getSetting(SETTING_KEYS.smtpPort),
    getSetting(SETTING_KEYS.smtpSecure),
    getSetting(SETTING_KEYS.smtpUser),
    getSetting(SETTING_KEYS.smtpFrom),
    getVuuptTokenStatus(),
    getSetting(SETTING_KEYS.zohoClientId),
    getSetting(SETTING_KEYS.zohoClientSecret),
    getSetting(SETTING_KEYS.zohoRedirectUri),
    getSetting(SETTING_KEYS.zohoAccountsBaseUrl),
    getSetting(SETTING_KEYS.paymentOptionsEnabled),
    getSetting(SETTING_KEYS.signatureEnabled),
    getSetting(SETTING_KEYS.labelMarginTop),
    getSetting(SETTING_KEYS.labelMarginBottom),
    getSetting(SETTING_KEYS.labelMarginLeft),
    getSetting(SETTING_KEYS.labelMarginRight),
  ]);

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-5 p-6 pb-16">
      <h1 className="text-xl font-bold text-foreground">Configurações</h1>

      <Tabs defaultValue="empresa" className="gap-4">
        <TabsList className="w-full">
          <TabsTrigger value="empresa">Empresa</TabsTrigger>
          <TabsTrigger value="etiqueta">Etiqueta</TabsTrigger>
          <TabsTrigger value="email">E-mail</TabsTrigger>
          <TabsTrigger value="zoho">Zoho</TabsTrigger>
        </TabsList>

        <TabsContent value="empresa" className="flex flex-col gap-5">
          <LogoUploadForm logoUrl={logoUrl || null} />

          <SettingsForm
            companyName={companyName || 'Minha Empresa'}
            vuuptTokenConfigured={Boolean(vuuptToken)}
            vuuptTokenMasked={maskToken(vuuptToken)}
          />

          <VuuptStatusCard
            configured={vuuptStatus.configured}
            expiresAtLabel={vuuptStatus.expiresAt ? vuuptStatus.expiresAt.toLocaleDateString('pt-BR') : null}
            isExpired={vuuptStatus.isExpired}
            isExpiringSoon={vuuptStatus.isExpiringSoon}
          />
        </TabsContent>

        <TabsContent value="etiqueta">
          <LabelSettingsForm
            paymentOptionsEnabled={paymentOptionsEnabled !== 'false'}
            signatureEnabled={signatureEnabled === 'true'}
            marginTopMm={parseLabelMargin(marginTop)}
            marginBottomMm={parseLabelMargin(marginBottom)}
            marginLeftMm={parseLabelMargin(marginLeft, DEFAULT_LABEL_MARGIN_X_MM)}
            marginRightMm={parseLabelMargin(marginRight, DEFAULT_LABEL_MARGIN_X_MM)}
          />
        </TabsContent>

        <TabsContent value="email">
          <SmtpSettingsForm
            smtpHost={smtpHost}
            smtpPort={smtpPort}
            smtpSecure={smtpSecure === 'true'}
            smtpUser={smtpUser}
            smtpFrom={smtpFrom}
            smtpConfigured={Boolean(smtpHost && smtpPort)}
          />
        </TabsContent>

        <TabsContent value="zoho">
          <ZohoSettingsForm
            clientId={zohoClientId}
            clientSecretConfigured={Boolean(zohoClientSecret)}
            redirectUri={zohoRedirectUri}
            accountsBaseUrl={zohoAccountsBaseUrl}
            configured={Boolean(zohoClientId && zohoClientSecret && zohoRedirectUri)}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
