import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import * as S from "./style";
import {
  listProdutos,
  createProduto,
  deleteProduto,
  type Produto,
} from "../../services/produtosService";
import { listSupplies, type Supply } from "../../services/insumosService";

type ProdutoForm = {
  name: string;
  basePrice: string;
  active: boolean;
};

type CompositionItem = {
  supplyId: number;
  quantity: number;
};

export function Products() {
  const [products, setProducts] = useState<Produto[]>([]);
  const [supplies, setSupplies] = useState<Supply[]>([]);
  const [composition, setComposition] = useState<CompositionItem[]>([]);
  const [form, setForm] = useState<ProdutoForm>({ name: "", basePrice: "", active: true });
  const [selectedSupplyId, setSelectedSupplyId] = useState<string>("");
  const [selectedQuantity, setSelectedQuantity] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function fetchData() {
      setIsLoading(true);
      setFeedback(null);
      try {
        const [prodList, supplyList] = await Promise.all([listProdutos(), listSupplies()]);
        if (active) {
          setProducts(prodList);
          setSupplies(supplyList);
        }
      } catch (error) {
        if (active) setFeedback(error instanceof Error ? error.message : "Erro ao carregar produtos/insumos.");
      } finally {
        if (active) setIsLoading(false);
      }
    }

    fetchData();
    return () => {
      active = false;
    };
  }, []);

  const compositionCost = useMemo(() => {
    return composition.reduce((total, item) => {
      const supply = supplies.find((s) => s.id === item.supplyId);
      if (!supply) return total;
      return total + supply.price * item.quantity;
    }, 0);
  }, [composition, supplies]);

  const descriptionText = useMemo(() => {
    return composition
      .map((item) => {
        const supply = supplies.find((s) => s.id === item.supplyId);
        if (!supply) return null;
        const unit = supply.unit ? ` ${supply.unit}` : "";
        return `${item.quantity}${unit} de ${supply.name}`;
      })
      .filter(Boolean)
      .join("; ");
  }, [composition, supplies]);

  const handleAddComposition = () => {
    const supplyIdNum = Number.parseInt(selectedSupplyId, 10);
    const qty = Number.parseFloat(selectedQuantity.replace(",", "."));
    if (!supplyIdNum || Number.isNaN(qty) || qty <= 0) {
      setFeedback("Selecione um insumo e informe uma quantidade válida.");
      return;
    }

    const supplyExists = supplies.find((s) => s.id === supplyIdNum);
    if (!supplyExists) {
      setFeedback("Insumo inválido.");
      return;
    }

    setComposition((prev) => {
      const existing = prev.find((item) => item.supplyId === supplyIdNum);
      if (existing) {
        return prev.map((item) =>
          item.supplyId === supplyIdNum ? { ...item, quantity: item.quantity + qty } : item
        );
      }
      return [...prev, { supplyId: supplyIdNum, quantity: qty }];
    });

    setSelectedSupplyId("");
    setSelectedQuantity("");
    setFeedback(null);
  };

  const handleRemoveComposition = (supplyId: number) => {
    setComposition((prev) => prev.filter((item) => item.supplyId !== supplyId));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.name.trim() || isSaving) return;

    const basePrice = Number.parseFloat(form.basePrice.replace(",", "."));
    if (Number.isNaN(basePrice)) {
      setFeedback("Preço base precisa ser um número válido.");
      return;
    }

    if (composition.length === 0) {
      setFeedback("Adicione pelo menos um insumo ao produto.");
      return;
    }

    setIsSaving(true);
    setFeedback(null);
    try {
      const created = await createProduto({
        name: form.name.trim(),
        description: descriptionText || undefined,
        cost: compositionCost,
        basePrice,
        active: form.active,
      });
      setProducts((prev) => [...prev, created]);
      setForm({ name: "", basePrice: "", active: true });
      setComposition([]);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Não foi possível salvar o produto.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    setFeedback(null);
    try {
      await deleteProduto(id);
      setProducts((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Não foi possível remover o produto.");
    }
  };

  const metrics = useMemo(() => {
    const registeredItems = products.length;
    const totalActive = products.filter((p) => p.active).length;
    const totalCost = products.reduce((total, current) => total + current.cost, 0);
    const totalBasePrice = products.reduce((total, current) => total + current.basePrice, 0);
    return { registeredItems, totalActive, totalCost, totalBasePrice };
  }, [products]);

  return (
    <main style={S.screen}>
      <section style={S.surface}>
        <header style={S.header}>
          <div>
            <p style={S.headline}>Produtos</p>
            <span style={S.supportText}>
              Monte o produto com insumos. O custo é calculado automaticamente pelo total dos insumos adicionados.
            </span>
          </div>
        </header>

        <form style={S.form} onSubmit={handleSubmit}>
          <label style={S.label}>
            Nome do produto
            <input
              name="name"
              style={S.input}
              placeholder="Ex.: Bolo de chocolate"
              value={form.name}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
              required
            />
          </label>

          <div style={S.compositionRow}>
            <label style={{ ...S.label, flex: "1 1 180px" }}>
              Insumo
              <select
                style={S.input}
                value={selectedSupplyId}
                onChange={(event) => setSelectedSupplyId(event.target.value)}
              >
                <option value="">Selecione um insumo</option>
                {supplies.map((supply) => (
                  <option key={supply.id} value={supply.id}>
                    {supply.name} ({supply.unit ?? "unidade"}) -
                    {" "}
                    {supply.price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </option>
                ))}
              </select>
            </label>

            <label style={{ ...S.label, flex: "1 1 140px" }}>
              Quantidade
              <input
                name="quantity"
                type="number"
                min="0"
                step="0.01"
                style={S.input}
                placeholder="0"
                value={selectedQuantity}
                onChange={(event) => setSelectedQuantity(event.target.value)}
                disabled={!selectedSupplyId}
              />
            </label>

            <button type="button" style={S.addButton} onClick={handleAddComposition} disabled={!selectedSupplyId}>
              Adicionar
            </button>
          </div>

          {composition.length > 0 && (
            <div style={S.chipsContainer}>
              {composition.map((item) => {
                const supply = supplies.find((s) => s.id === item.supplyId);
                if (!supply) return null;
                return (
                  <span key={item.supplyId} style={S.chip}>
                    <span>
                      {item.quantity} {supply.unit ?? "unid."} de {supply.name}
                    </span>
                    <button type="button" style={S.chipRemove} onClick={() => handleRemoveComposition(item.supplyId)}>
                      ×
                    </button>
                  </span>
                );
              })}
            </div>
          )}

          <label style={S.label}>
            Descrição (gerado pelos insumos)
            <textarea style={S.textarea} value={descriptionText} readOnly placeholder="Será preenchida ao adicionar insumos" />
          </label>

          <div style={S.inlineGroup}>
            <label style={S.label}>
              Custo (auto)
              <input
                name="cost"
                type="text"
                style={{ ...S.input, backgroundColor: "#f5f3ef" }}
                value={compositionCost.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                readOnly
              />
            </label>

            <label style={S.label}>
              Preço base (R$)
              <input
                name="basePrice"
                type="number"
                min="0"
                step="0.01"
                style={S.input}
                placeholder="0,00"
                value={form.basePrice}
                onChange={(event) => setForm((prev) => ({ ...prev, basePrice: event.target.value }))}
                required
              />
            </label>

            <label style={{ ...S.label, flex: "1 1 140px" }}>
              Ativo
              <select
                name="active"
                style={S.input}
                value={form.active ? "true" : "false"}
                onChange={(event) => setForm((prev) => ({ ...prev, active: event.target.value === "true" }))}
              >
                <option value="true">Sim</option>
                <option value="false">Não</option>
              </select>
            </label>
          </div>

          <button type="submit" style={{ ...S.button, opacity: isSaving ? 0.7 : 1 }} disabled={isSaving}>
            {isSaving ? "Salvando..." : "Salvar produto"}
          </button>
          {feedback && <p style={S.errorMessage}>{feedback}</p>}
        </form>
      </section>

      <section style={S.listCard}>
        <div style={S.metricsRow}>
          <div style={S.metricBox}>
            <strong style={S.metricValue}>{metrics.registeredItems}</strong>
            <span style={S.metricLabel}>produtos cadastrados</span>
          </div>
          <div style={S.metricBox}>
            <strong style={S.metricValue}>{metrics.totalActive}</strong>
            <span style={S.metricLabel}>produtos ativos</span>
          </div>
          <div style={S.metricBox}>
            <strong style={S.metricValue}>{metrics.totalCost.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</strong>
            <span style={S.metricLabel}>custo total</span>
          </div>
          <div style={S.metricBox}>
            <strong style={S.metricValue}>{metrics.totalBasePrice.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</strong>
            <span style={S.metricLabel}>preço base total</span>
          </div>
        </div>

        {isLoading ? (
          <p style={S.infoMessage}>Carregando produtos...</p>
        ) : products.length === 0 ? (
          <p style={S.emptyState}>Nenhum produto cadastrado ainda.</p>
        ) : (
          <div style={S.tableWrapper}>
            <table style={S.table}>
              <thead>
                <tr>
                  <th style={S.tableHeader}>Nome</th>
                  <th style={S.tableHeader}>Custo</th>
                  <th style={S.tableHeader}>Preço base</th>
                  <th style={S.tableHeader}>Ativo</th>
                  <th style={S.tableHeader}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td style={S.tableCell}>{product.name}</td>
                    <td style={S.tableCell}>
                      {product.cost.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                    </td>
                    <td style={S.tableCell}>
                      {product.basePrice.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                    </td>
                    <td style={S.tableCell}>{product.active ? "Sim" : "Não"}</td>
                    <td style={S.tableCell}>
                      <button type="button" style={S.deleteButton} onClick={() => handleDelete(product.id)}>
                        Remover
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
