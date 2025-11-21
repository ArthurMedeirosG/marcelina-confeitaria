import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import * as S from "./style";
import { listProdutos, type Produto } from "../../services/produtosService";
import { createVenda, deleteVenda, listVendas, updateVenda, type Venda } from "../../services/vendasService";

type SaleItemDraft = {
  productId: number;
  quantity: string;
  unitPrice: string;
};

type SaleForm = {
  customerName: string;
  notes: string;
  paymentMethod: string;
  status: string;
  saleDate: string;
};

const PAYMENT_OPTIONS = ["dinheiro", "cartao-debito", "cartao-credito", "pix", "outro"];
const STATUS_OPTIONS = ["aberta", "paga", "cancelada"];

export function Sales() {
  const [products, setProducts] = useState<Produto[]>([]);
  const [sales, setSales] = useState<Venda[]>([]);
  const [items, setItems] = useState<SaleItemDraft[]>([]);
  const [form, setForm] = useState<SaleForm>({
    customerName: "",
    notes: "",
    paymentMethod: "",
    status: "aberta",
    saleDate: new Date().toISOString().split("T")[0],
  });
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [selectedQuantity, setSelectedQuantity] = useState<string>("");
  const [selectedUnitPrice, setSelectedUnitPrice] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [editingSale, setEditingSale] = useState<Venda | null>(null);
  const [editForm, setEditForm] = useState<SaleForm | null>(null);

  useEffect(() => {
    let active = true;

    async function fetchData() {
      setIsLoading(true);
      setFeedback(null);
      try {
        const [prodList, salesList] = await Promise.all([listProdutos(), listVendas()]);
        if (active) {
          setProducts(prodList);
          setSales(salesList);
        }
      } catch (error) {
        if (active) setFeedback(error instanceof Error ? error.message : "Erro ao carregar vendas.");
      } finally {
        if (active) setIsLoading(false);
      }
    }

    fetchData();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (selectedProductId) {
      const prod = products.find((p) => p.id === Number(selectedProductId));
      if (prod) {
        setSelectedUnitPrice(prod.basePrice.toString());
      }
    }
  }, [selectedProductId, products]);

  const total = useMemo(() => {
    return items.reduce((sum, item) => {
      const qty = Number.parseFloat(item.quantity.replace(",", ".")) || 0;
      const price = Number.parseFloat(item.unitPrice.replace(",", ".")) || 0;
      return sum + qty * price;
    }, 0);
  }, [items]);

  const handleAddItem = () => {
    const productIdNum = Number.parseInt(selectedProductId, 10);
    const qty = Number.parseFloat(selectedQuantity.replace(",", "."));
    const price = Number.parseFloat(selectedUnitPrice.replace(",", "."));

    if (!productIdNum || Number.isNaN(qty) || Number.isNaN(price) || qty <= 0 || price < 0) {
      setFeedback("Selecione um produto e informe quantidade/preço válidos.");
      return;
    }

    setItems((prev) => {
      const existing = prev.find((item) => item.productId === productIdNum);
      if (existing) {
        return prev.map((item) =>
          item.productId === productIdNum
            ? { ...item, quantity: (Number(item.quantity) + qty).toString(), unitPrice: price.toString() }
            : item
        );
      }
      return [...prev, { productId: productIdNum, quantity: qty.toString(), unitPrice: price.toString() }];
    });

    setSelectedProductId("");
    setSelectedQuantity("");
    setSelectedUnitPrice("");
    setFeedback(null);
  };

  const handleRemoveItem = (productId: number) => {
    setItems((prev) => prev.filter((item) => item.productId !== productId));
  };

  const handleOpenEdit = (sale: Venda) => {
    setEditingSale(sale);
    setEditForm({
      customerName: sale.customerName ?? "",
      notes: sale.notes ?? "",
      paymentMethod: sale.paymentMethod ?? "",
      status: sale.status ?? "aberta",
      saleDate: sale.saleDate ? sale.saleDate.split("T")[0] : new Date().toISOString().split("T")[0],
    });
  };

  const handleCloseEdit = () => {
    setEditingSale(null);
    setEditForm(null);
  };

  const handleSaveEdit = async () => {
    if (!editingSale || !editForm) return;
    setIsSaving(true);
    setFeedback(null);

    try {
      const updated = await updateVenda(editingSale.id, {
        customerName: editForm.customerName.trim() || undefined,
        notes: editForm.notes.trim() || undefined,
        paymentMethod: editForm.paymentMethod || undefined,
        status: editForm.status,
        saleDate: editForm.saleDate ? new Date(editForm.saleDate).toISOString() : undefined,
      });
      setSales((prev) => prev.map((s) => (s.id === editingSale.id ? updated : s)));
      handleCloseEdit();
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Não foi possível atualizar a venda.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteEdit = async () => {
    if (!editingSale) return;
    setFeedback("Antes de excluir, certifique-se de que a venda não é necessária para controles futuros.");
    try {
      await deleteVenda(editingSale.id);
      setSales((prev) => prev.filter((s) => s.id !== editingSale.id));
      handleCloseEdit();
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Não foi possível excluir a venda.");
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (items.length === 0 || isSaving) {
      setFeedback("Adicione pelo menos um produto à venda.");
      return;
    }

    const payloadItems = items.map((item) => ({
      productId: item.productId,
      quantity: Number.parseFloat(item.quantity.replace(",", ".")),
      unitPrice: Number.parseFloat(item.unitPrice.replace(",", ".")),
    }));

    if (payloadItems.some((it) => Number.isNaN(it.quantity) || Number.isNaN(it.unitPrice))) {
      setFeedback("Quantidade e preço precisam ser válidos.");
      return;
    }

    setIsSaving(true);
    setFeedback(null);

    try {
      const created = await createVenda({
        customerName: form.customerName.trim() || undefined,
        notes: form.notes.trim() || undefined,
        paymentMethod: form.paymentMethod || undefined,
        status: form.status,
        saleDate: form.saleDate ? new Date(form.saleDate).toISOString() : undefined,
        items: payloadItems,
      });
      setSales((prev) => [created, ...prev]);
      setItems([]);
      setForm({ customerName: "", notes: "", paymentMethod: "", status: "aberta", saleDate: new Date().toISOString().split("T")[0] });
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Não foi possível salvar a venda.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main style={S.screen}>
      <section style={S.surface}>
        <header style={S.header}>
          <div>
            <p style={S.headline}>Vendas</p>
            <span style={S.supportText}>Monte a venda selecionando produtos; o total é calculado automaticamente.</span>
          </div>
        </header>

        <form style={S.form} onSubmit={handleSubmit}>
          <div style={S.inlineGroup}>
            <label style={S.label}>
              Cliente
              <input
                style={S.input}
                placeholder="Nome do cliente"
                value={form.customerName}
                onChange={(event) => setForm((prev) => ({ ...prev, customerName: event.target.value }))}
              />
            </label>

            <label style={S.label}>
              Data da venda
              <input
                type="date"
                style={S.input}
                value={form.saleDate}
                onChange={(event) => setForm((prev) => ({ ...prev, saleDate: event.target.value }))}
              />
            </label>
          </div>

          <label style={S.label}>
            Observação
            <textarea
              style={S.textarea}
              placeholder="Alguma observação sobre esta venda"
              value={form.notes}
              onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))}
            />
          </label>

          <div style={S.inlineGroup}>
            <label style={S.label}>
              Forma de pagamento
              <select
                style={S.input}
                value={form.paymentMethod}
                onChange={(event) => setForm((prev) => ({ ...prev, paymentMethod: event.target.value }))}
              >
                <option value="">Selecione</option>
                {PAYMENT_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </label>

            <label style={S.label}>
              Status
              <select
                style={S.input}
                value={form.status}
                onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value }))}
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div style={S.compositionRow}>
            <label style={{ ...S.label, flex: "1 1 200px" }}>
              Produto
              <select
                style={S.input}
                value={selectedProductId}
                onChange={(event) => setSelectedProductId(event.target.value)}
              >
                <option value="">Selecione um produto</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} - {product.basePrice.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </option>
                ))}
              </select>
            </label>

            <label style={{ ...S.label, flex: "1 1 120px" }}>
              Quantidade
              <input
                type="number"
                min="0"
                step="0.01"
                style={S.input}
                placeholder="0"
                value={selectedQuantity}
                onChange={(event) => setSelectedQuantity(event.target.value)}
                disabled={!selectedProductId}
              />
            </label>

            <label style={{ ...S.label, flex: "1 1 140px" }}>
              Preço unitário
              <input
                type="number"
                min="0"
                step="0.01"
                style={S.input}
                placeholder="0,00"
                value={selectedUnitPrice}
                onChange={(event) => setSelectedUnitPrice(event.target.value)}
                disabled={!selectedProductId}
              />
            </label>

            <button type="button" style={S.addButton} onClick={handleAddItem} disabled={!selectedProductId}>
              Adicionar
            </button>
          </div>

          {items.length > 0 && (
            <div style={S.chipsContainer}>
              {items.map((item) => {
                const product = products.find((p) => p.id === item.productId);
                if (!product) return null;
                return (
                  <span key={item.productId} style={S.chip}>
                    <span>
                      {product.name} - {item.quantity} x {Number(item.unitPrice).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                    </span>
                    <button type="button" style={S.chipRemove} onClick={() => handleRemoveItem(item.productId)}>
                      ×
                    </button>
                  </span>
                );
              })}
            </div>
          )}

          <div style={S.inlineGroup}>
            <label style={S.label}>
              Total
              <input
                type="text"
                style={{ ...S.input, backgroundColor: "#f5f3ef" }}
                value={total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                readOnly
              />
            </label>
          </div>

          <button type="submit" style={{ ...S.button, opacity: isSaving ? 0.7 : 1 }} disabled={isSaving}>
            {isSaving ? "Salvando..." : "Salvar venda"}
          </button>
          {feedback && <p style={S.errorMessage}>{feedback}</p>}
        </form>
      </section>

      <section style={S.listCard}>
        {isLoading ? (
          <p style={S.infoMessage}>Carregando vendas...</p>
        ) : sales.length === 0 ? (
          <p style={S.emptyState}>Nenhuma venda cadastrada ainda.</p>
        ) : (
          <div style={S.tableWrapper}>
            <table style={S.table}>
              <thead>
                <tr>
                  <th style={S.tableHeader}>Cliente</th>
                  <th style={S.tableHeader}>Stat.</th>
                  <th style={S.tableHeader}>Pgto</th>
                  <th style={S.tableHeader}>Data</th>
                  <th style={S.tableHeader}>Total (R$)</th>
                </tr>
              </thead>
              <tbody>
                {sales.map((sale) => (
                  <tr key={sale.id}>
                    <td style={S.tableCell}>
                      <span style={S.truncateCell} title={sale.customerName ?? "—"}>
                        {sale.customerName
                          ? sale.customerName.length > 6
                            ? `${sale.customerName.slice(0, 6)}…`
                            : sale.customerName
                          : "—"}
                      </span>
                    </td>
                    <td style={S.tableCell}>
                      <span style={S.truncateCell}>{sale.status ?? "—"}</span>
                    </td>
                    <td style={S.tableCell}>
                      <span style={S.truncateCell}>{sale.paymentMethod ?? "—"}</span>
                    </td>
                    <td style={S.tableCell}>
                      <span style={S.truncateCell}>
                        {sale.saleDate
                          ? new Date(sale.saleDate).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })
                          : "—"}
                      </span>
                    </td>
                    <td style={S.tableCellTotal}>
                      <span style={S.truncateCell}>
                        {sale.total.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                      <button type="button" style={S.editButton} onClick={() => handleOpenEdit(sale)} aria-label="Editar venda">
                        ✎
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {editingSale && editForm && (
        <div style={S.modalOverlay}>
          <div style={S.modal}>
            <h3 style={S.modalTitle}>Editar venda</h3>
            <div style={S.modalContent}>
              <label style={S.label}>
                Cliente
                <input
                  style={S.input}
                  value={editForm.customerName}
                  onChange={(event) => setEditForm((prev) => (prev ? { ...prev, customerName: event.target.value } : prev))}
                />
              </label>
              <label style={S.label}>
                Data da venda
                <input
                  type="date"
                  style={S.input}
                  value={editForm.saleDate}
                  onChange={(event) => setEditForm((prev) => (prev ? { ...prev, saleDate: event.target.value } : prev))}
                />
              </label>
              <label style={S.label}>
                Observação
                <textarea
                  style={S.textarea}
                  value={editForm.notes}
                  onChange={(event) => setEditForm((prev) => (prev ? { ...prev, notes: event.target.value } : prev))}
                />
              </label>
              <label style={S.label}>
                Forma de pagamento
                <select
                  style={S.input}
                  value={editForm.paymentMethod}
                  onChange={(event) => setEditForm((prev) => (prev ? { ...prev, paymentMethod: event.target.value } : prev))}
                >
                  <option value="">Selecione</option>
                  {PAYMENT_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </label>
              <label style={S.label}>
                Status
                <select
                  style={S.input}
                  value={editForm.status}
                  onChange={(event) => setEditForm((prev) => (prev ? { ...prev, status: event.target.value } : prev))}
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div style={S.modalActions}>
              <button type="button" style={S.modalButtonSecondary} onClick={handleCloseEdit}>
                Cancelar
              </button>
              <button type="button" style={S.modalButtonDanger} onClick={handleDeleteEdit}>
                Excluir
              </button>
              <button type="button" style={S.modalButtonPrimary} onClick={handleSaveEdit} disabled={isSaving}>
                {isSaving ? "Salvando..." : "Salvar"}
              </button>
            </div>
            <p style={S.modalHint}>Antes de excluir uma venda, confirme se ela não é necessária para relatórios ou estoque.</p>
          </div>
        </div>
      )}
    </main>
  );
}
