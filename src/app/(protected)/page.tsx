import { fetchRecentRoutes, fetchRouteServices, VuuptError } from '@/lib/vuupt';
import { getPublicSettings, getSetting, SETTING_KEYS, DEFAULT_LABEL_MARGIN_MM, parseLabelMargin } from '@/lib/settings';
import { StatusMessage } from '@/components/StatusMessage';
import type { RoutesPage } from '@/types';
import { RouteSelect } from './RouteSelect';
import { LabelSelectionGrid } from './LabelSelectionGrid';

interface RouteSelectorPageProps {
  searchParams: Promise<{ routeId?: string }>;
}

export default async function RouteSelectorPage({ searchParams }: RouteSelectorPageProps) {
  const { routeId: requestedRouteId } = await searchParams;

  const [routesResult, branding, paymentOptionsSetting, marginTopSetting, marginBottomSetting] =
    await Promise.allSettled([
      fetchRecentRoutes(1),
      getPublicSettings(),
      getSetting(SETTING_KEYS.paymentOptionsEnabled),
      getSetting(SETTING_KEYS.labelMarginTop),
      getSetting(SETTING_KEYS.labelMarginBottom),
    ]);

  const routesPage: RoutesPage | null = routesResult.status === 'fulfilled' ? routesResult.value : null;
  const routesError =
    routesResult.status === 'rejected'
      ? routesResult.reason instanceof VuuptError
        ? routesResult.reason.message
        : 'Não foi possível carregar as rotas.'
      : null;
  const logoUrl = branding.status === 'fulfilled' ? branding.value.logoUrl : null;
  const paymentOptionsEnabled =
    paymentOptionsSetting.status === 'fulfilled' ? paymentOptionsSetting.value !== 'false' : true;
  const marginTopMm =
    marginTopSetting.status === 'fulfilled' ? parseLabelMargin(marginTopSetting.value) : DEFAULT_LABEL_MARGIN_MM;
  const marginBottomMm =
    marginBottomSetting.status === 'fulfilled'
      ? parseLabelMargin(marginBottomSetting.value)
      : DEFAULT_LABEL_MARGIN_MM;

  // Sem rota escolhida na URL, usa a primeira da lista (a mais recente).
  const activeRouteId = requestedRouteId || (routesPage?.routes[0] ? String(routesPage.routes[0].id) : '');
  const activeRoute = routesPage?.routes.find((route) => String(route.id) === activeRouteId);

  let services: Awaited<ReturnType<typeof fetchRouteServices>> = [];
  let servicesError: string | null = null;

  if (activeRouteId && !routesError) {
    try {
      services = await fetchRouteServices(activeRouteId);
    } catch (err) {
      servicesError =
        err instanceof VuuptError ? err.message : 'Não foi possível carregar os endereços desta rota.';
    }
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 p-6 pb-16 print:m-0 print:max-w-none print:gap-0 print:p-0">
      <div className="w-full max-w-sm print:hidden">
        <h1 className="mb-3 text-lg font-semibold text-foreground">Gerador de Impressos de Endereços</h1>

        {routesError && <StatusMessage tone="error">{routesError}</StatusMessage>}

        {!routesError && routesPage && routesPage.routes.length === 0 && (
          <StatusMessage tone="info">Nenhuma rota encontrada nos últimos dias.</StatusMessage>
        )}

        {!routesError && routesPage && routesPage.routes.length > 0 && (
          <RouteSelect routes={routesPage.routes} value={activeRouteId} />
        )}
      </div>

      {servicesError && <StatusMessage tone="error">{servicesError}</StatusMessage>}

      {!servicesError && activeRouteId && services.length === 0 && (
        <StatusMessage tone="info">Nenhum endereço encontrado para esta rota.</StatusMessage>
      )}

      {services.length > 0 && (
        <LabelSelectionGrid
          // Força remontar o componente ao trocar de rota — sem isso, o
          // useState de seleção mantinha o Set com os ids da rota anterior,
          // e como os novos serviços têm ids diferentes, tudo aparecia
          // desmarcado em vez de voltar pro padrão "todas selecionadas".
          key={activeRouteId}
          services={services}
          routeId={activeRouteId}
          routeName={activeRoute?.name ?? activeRouteId}
          logoUrl={logoUrl}
          paymentOptionsEnabled={paymentOptionsEnabled}
          marginTopMm={marginTopMm}
          marginBottomMm={marginBottomMm}
        />
      )}
    </div>
  );
}
