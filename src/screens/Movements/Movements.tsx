import { useEffect, useMemo, useState } from "react";
import * as S from "./style";
import { listMovimentacoes, type Movimento, type MovimentoFilters } from "../../services/movimentacoesService";
import { listSupplies, type Supply } from "../../services/insumosService";

const TYPE_OPTIONS = [
  { value: "", label: "Todos" },
  { value: "entrada_insumo", label: "Entrada" },
  { value: "saida_insumo", label: "Saída" },
  { value: "ajuste", label: "Ajuste" },
  { value: "saida_por_venda", label: "Saída por venda" },
];

export function Movements() {
  const [movements, setMovements] = useState<Movimento[]>([]);
  const [supplies, setSupplies] = useState<Supply[]>([]);
  const [filters, setFilters] = useState<MovimentoFilters>({ startDate: "", endDate: "", type: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function fetchData() {
      setIsLoading(true);
      setFeedback(null);
      try {
        const [movementList, suppliesList] = await Promise.all([listMovimentacoes(), listSupplies()]);
        if (active) {
          setMovements(movementList);
          setSupplies(suppliesList);
        }
      } catch (error) {
        if (active) setFeedback(error instanceof Error ? error.message : "Erro ao carregar movimentações.");
      } finally {
        if (active) setIsLoading(false);
      }
    }

    fetchData();
    return () => {
      active = false;
    };
  }, []);

  const filteredMovements = useMemo(() => {
    return movements.filter((mov) => {
      if (filters.type && mov.type !== filters.type) return false;
      if (filters.supplyId && mov.supplyId !== filters.supplyId) return false;
      if (filters.startDate && mov.movementDate && mov.movementDate < filters.startDate) return false;
      if (filters.endDate && mov.movementDate && mov.movementDate > filters.endDate) return false;
      return true;
    });
  }, [movements, filters]);

  const summary = useMemo(() => {
    const entradas = filteredMovements
      .filter((m) => m.type === "entrada_insumo")
      .reduce((total, m) => total + m.quantity * (m.unitValue ?? 0), 0);
    const saidas = filteredMovements
      .filter((m) => m.type !== "entrada_insumo")
      .reduce((total, m) => total + m.quantity * (m.unitValue ?? 0), 0);
    const totalMov = filteredMovements.length;
    return { entradas, saidas, totalMov };
  }, [filteredMovements]);

  const handleFilterChange = (field: keyof MovimentoFilters, value: string | number | undefined) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <main style={S.screen}>
      <section style={S.surface}>
        <header style={S.header}>
          <div>
            <p style={S.headline}>Movimentações</p>
            <span style={S.supportText}>Acompanhe entradas, saídas e ajustes de insumos.</span>
          </div>
        </header>

        <div style={S.filters}>
          <label style={S.label}>
            Tipo
            <select
              style={S.input}
              value={filters.type ?? ""}
              onChange={(e) => handleFilterChange("type", e.target.value || undefined)}
            >
              {TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>

          <label style={S.label}>
            Insumo
            <select
              style={S.input}
              value={filters.supplyId ?? ""}
              onChange={(e) => handleFilterChange("supplyId", e.target.value ? Number(e.target.value) : undefined)}
            >
              <option value="">Todos</option>
              {supplies.map((supply) => (
                <option key={supply.id} value={supply.id}>
                  {supply.name}
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
              onChange={(e) => handleFilterChange("startDate", e.target.value || undefined)}
            />
          </label>

          <label style={S.label}>
            Data final
            <input
              type="date"
              style={S.input}
              value={filters.endDate ?? ""}
              onChange={(e) => handleFilterChange("endDate", e.target.value || undefined)}
            />
          </label>
        </div>
      </section>

      <section style={S.listCard}>
        <div style={S.metricsRow}>
          <div style={S.metricBox}>
            <strong style={S.metricValue}>{summary.totalMov}</strong>
            <span style={S.metricLabel}>movimentações</span>
          </div>
          <div style={S.metricBox}>
            <strong style={S.metricValue}>{summary.entradas.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</strong>
            <span style={S.metricLabel}>entradas</span>
          </div>
          <div style={S.metricBox}>
            <strong style={S.metricValue}>{summary.saidas.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</strong>
            <span style={S.metricLabel}>saídas</span>
          </div>
        </div>

        {isLoading ? (
          <p style={S.infoMessage}>Carregando movimentações...</p>
        ) : filteredMovements.length === 0 ? (
          <p style={S.emptyState}>Nenhuma movimentação encontrada.</p>
        ) : (
          <div style={S.tableWrapper}>
            <table style={S.table}>
              <thead>
                <tr>
                  <th style={S.tableHeader}>Tipo</th>
                  <th style={S.tableHeader}>Insumo</th>
                  <th style={S.tableHeader}>Qtd</th>
                  <th style={S.tableHeader}>Vlr unit.</th>
                  <th style={S.tableHeader}>Data</th>
                  <th style={S.tableHeader}>Obs.</th>
                </tr>
              </thead>
              <tbody>
                {filteredMovements.map((mov) => {
                  const supply = supplies.find((s) => s.id === mov.supplyId);
                  const dateLabel = mov.movementDate
                    ? new Date(mov.movementDate).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })
                    : "—";
                  return (
                    <tr key={mov.id}>
                      <td style={S.tableCell}>{mov.type}</td>
                      <td style={S.tableCell}>{supply?.name ?? "—"}</td>
                      <td style={S.tableCell}>{mov.quantity} {mov.unit ?? ""}</td>
                      <td style={S.tableCell}>
                        {mov.unitValue != null
                          ? mov.unitValue.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
                          : "—"}
                      </td>
                      <td style={S.tableCell}>{dateLabel}</td>
                      <td style={S.tableCell}>{mov.note ?? ""}</td>
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
