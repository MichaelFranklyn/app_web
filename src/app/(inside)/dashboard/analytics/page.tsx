import AnalyticsContent from "./content";

// Página client-heavy (gráficos ECharts via dynamic ssr:false) e escopada por
// auth — renderizada sob demanda, não prerenderizada estaticamente.
export const dynamic = "force-dynamic";

export default function AnalyticsPage() {
  return <AnalyticsContent />;
}
