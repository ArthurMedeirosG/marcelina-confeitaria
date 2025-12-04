import { useEffect, useMemo, useState } from "react";
import Chart from "react-apexcharts";
import * as S from "./style";
import { listVendaItensDetalhados, type VendaItensFiltro, type VendaItemDetalhado } from "../../services/vendasAnalyticsService";
import { listProdutos, type Produto } from "../../services/produtosService";

const STATUS_OPTIONS = [
  { value: "", label: "Todos" },
  { value: "aberta", label: "Aberta" },
  { value: "paga", label: "Paga" },
  { value: "cancelada", label: "Cancelada" },
];

const PAYMENT_OPTIONS = [
  { value: "", label: "Todos" },
  { value: "dinheiro", label: "Dinheiro" },
  { value: "cartao-debito", label: "Débito" },
  { value: "cartao-credito", label: "Crédito" },
  { value: "pix", label: "Pix" },
  { value: "outro", label: "Outro" },
];

export function SalesOverview() {
  const [items, setItems] = useState<VendaItemDetalhado[]>([]);
  const [products, setProducts] = useState<Produto[]>([]);
  const [filters, setFilters] = useState<VendaItensFiltro>({ startDate: "", endDate: "", status: "", payment: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function fetchData() {
      setIsLoading(true);
      setFeedback(null);
      try {
        const [itens, prods] = await Promise.all([listVendaItensDetalhados(), listProdutos()]);
        if (active) {
          setItems(itens);
          setProducts(prods);
        }
      } catch (error) {
        if (active) setFeedback(error instanceof Error ? error.message : "Erro ao carregar dados de vendas.");
      } finally {
        if (active) setIsLoading(false);
      }
    }

    fetchData();
    return () => {
      active = false;
    };
  }, []);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (filters.status && item.saleStatus !== filters.status) return false;
      if (filters.payment && item.salePayment !== filters.payment) return false;
      if (filters.startDate && item.saleDate && item.saleDate < filters.startDate) return false;
      if (filters.endDate && item.saleDate && item.saleDate > filters.endDate) return false;
      return true;
    });
  }, [items, filters]);

  const grouped = useMemo(() => {
    const map = new Map<number, { product: Produto | undefined; qty: number; revenue: number; cost: number }>();
    filteredItems.forEach((item) => {
      const current = map.get(item.productId) ?? { product: products.find((p) => p.id === item.productId), qty: 0, revenue: 0, cost: 0 };
      current.qty += item.quantity;
      current.revenue += item.subtotal;
      current.cost += item.costTotal ?? 0;
      map.set(item.productId, current);
    });
    return Array.from(map.entries()).map(([productId, value]) => ({ productId, ...value }));
  }, [filteredItems, products]);

  const totals = useMemo(() => {
    const revenue = grouped.reduce((sum, g) => sum + g.revenue, 0);
    const cost = grouped.reduce((sum, g) => sum + g.cost, 0);
    const margin = revenue - cost;
    const qty = grouped.reduce((sum, g) => sum + g.qty, 0);
    return { revenue, cost, margin, qty };
  }, [grouped]);

  const topProducts = useMemo(() => {
    return [...grouped]
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)
      .map((row) => ({
        name: row.product?.name ?? `#${row.productId}`,
        revenue: row.revenue,
        cost: row.cost,
        margin: row.revenue - row.cost,
      }));
  }, [grouped]);

  const chartOptions = useMemo(
    () => ({
      chart: { toolbar: { show: false } },
      dataLabels: { enabled: false },
      legend: { position: "top" as const },
      plotOptions: { bar: { horizontal: false, columnWidth: "45%" } },
      xaxis: { categories: topProducts.map((p) => p.name) },
      colors: ["#C2544A", "#F0C38E"],
      tooltip: {
        y: {
          formatter: (val: number) => val.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
        },
      },
    }),
    [topProducts]
  );

  const chartSeries = useMemo(
    () => [
      { name: "Receita", data: topProducts.map((p) => p.revenue) },
      { name: "Custo", data: topProducts.map((p) => p.cost) },
    ],
    [topProducts]
  );

  const handleFilterChange = (field: keyof VendaItensFiltro, value: string) => {
    setFilters((prev) => ({ ...prev, [field]: value || undefined }));
  };

  return (
    <main style={S.screen}>
      <section style={S.surface}>
        <header style={S.header}>
          <div>
            <p style={S.headline}>Visão de Vendas por Produto</p>
            <span style={S.supportText}>Filtre por período, status e forma de pagamento para ver produtos mais vendidos e margem.</span>
          </div>
        </header>

        <div style={S.filters}>
          <label style={S.label}>
            Status
            <select style={S.input} value={filters.status ?? ""} onChange={(e) => handleFilterChange("status", e.target.value)}>
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>

          <label style={S.label}>
            Pagamento
            <select style={S.input} value={filters.payment ?? ""} onChange={(e) => handleFilterChange("payment", e.target.value)}>
              {PAYMENT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>

          <label style={S.label}>
            Data inicial
            <input
              type="date"
              style={S.input}
              value={filters.startDate ?? ""}
              onChange={(e) => handleFilterChange("startDate", e.target.value)}
            />
          </label>

          <label style={S.label}>
            Data final
            <input
              type="date"
              style={S.input}
              value={filters.endDate ?? ""}
              onChange={(e) => handleFilterChange("endDate", e.target.value)}
            />
          </label>
        </div>
      </section>

      {topProducts.length > 0 && (
        <section style={S.chartCard}>
          <h3 style={S.chartTitle}>Top produtos por receita</h3>
          <Chart options={chartOptions} series={chartSeries} type="bar" height={320} />
        </section>
      )}
      <section style={S.listCard}>
        <div style={S.metricsRow}>
          <div style={S.metricBox}>
            <strong style={S.metricValue}>{totals.qty}</strong>
            <span style={S.metricLabel}>itens vendidos</span>
          </div>
          <div style={S.metricBox}>
            <strong style={S.metricValue}>{totals.revenue.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</strong>
            <span style={S.metricLabel}>receita</span>
          </div>
          <div style={S.metricBox}>
            <strong style={S.metricValue}>{totals.cost.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</strong>
            <span style={S.metricLabel}>custo</span>
          </div>
          <div style={S.metricBox}>
            <strong style={S.metricValue}>{(totals.revenue - totals.cost).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</strong>
            <span style={S.metricLabel}>margem</span>
          </div>
        </div>

        {isLoading ? (
          <p style={S.infoMessage}>Carregando vendas...</p>
        ) : grouped.length === 0 ? (
          <p style={S.emptyState}>Nenhum resultado para os filtros.</p>
        ) : (
          <div style={S.tableWrapper}>
            <table style={S.table}>
              <thead>
                <tr>
                  <th style={S.tableHeader}>Produto</th>
                  <th style={S.tableHeader}>Qtd</th>
                  <th style={S.tableHeader}>Receita</th>
                  <th style={S.tableHeader}>Custo</th>
                  <th style={S.tableHeader}>Margem</th>
                  <th style={S.tableHeader}>Margem %</th>
                </tr>
              </thead>
              <tbody>
                {grouped.map((row) => {
                  const margin = row.revenue - row.cost;
                  const marginPct = row.revenue > 0 ? (margin / row.revenue) * 100 : 0;
                  return (
                    <tr key={row.productId}>
                      <td style={S.tableCell}>{row.product?.name ?? `#${row.productId}`}</td>
                      <td style={S.tableCell}>{row.qty}</td>
                      <td style={S.tableCell}>{row.revenue.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</td>
                      <td style={S.tableCell}>{row.cost.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</td>
                      <td style={S.tableCell}>{margin.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</td>
                      <td style={S.tableCell}>{marginPct.toFixed(1)}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {feedback && <p style={S.errorMessage}>{feedback}</p>}
    </main>
  );
}


