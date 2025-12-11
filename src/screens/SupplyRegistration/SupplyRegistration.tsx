import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import * as S from "./style";
import { createSupply, deleteSupply, listSupplies, updateSupply, type Supply } from "../../services/insumosService";
import { createMovimentacao } from "../../services/movimentacoesService";

type SupplyForm = {
  name: string;
  quantity: string;
  price: string;
  unit: string;
};

const UNIT_OPTIONS = [
  { value: "u", label: "Unidade" },
  { value: "g", label: "Gramas" },
  { value: "kg", label: "Quilogramas" },
  { value: "ml", label: "Mililitros" },
  { value: "l", label: "Litros" },
];

const todayIso = () => new Date().toISOString().split("T")[0];

function normalizeUnit(value?: string | null) {
  if (!value) return "u";
  const lower = value.toLowerCase();
  if (lower === "unidade" || lower === "u" || lower === "uni") return "u";
  if (lower === "g" || lower === "grama" || lower === "gramas") return "g";
  if (lower === "kg" || lower === "quilograma" || lower === "quilogramas" || lower === "quilo" || lower === "quilos") return "kg";
  if (lower === "ml" || lower === "mililitro" || lower === "mililitros") return "ml";
  if (lower === "l" || lower === "lt" || lower === "litro" || lower === "litros") return "l";
  return "u";
}

function unitLabel(value?: string | null) {
  const found = UNIT_OPTIONS.find((opt) => opt.value === value);
  if (found) return found.label;
  return value ?? "-";
}

export function SupplyRegistration() {
  const [supplies, setSupplies] = useState<Supply[]>([]);
  const [form, setForm] = useState<SupplyForm>({ name: "", quantity: "", price: "", unit: "u" });
  const [editForm, setEditForm] = useState<SupplyForm | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [movementForm, setMovementForm] = useState({ quantity: "", unitValue: "", date: todayIso() });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function fetchSupplies() {
      setIsLoading(true);
      setFeedback(null);

      try {
        const items = await listSupplies();
        if (active) setSupplies(items);
      } catch (error) {
        if (active) setFeedback(error instanceof Error ? error.message : "Erro ao carregar os insumos.");
      } finally {
        if (active) setIsLoading(false);
      }
    }

    fetchSupplies();
    return () => {
      active = false;
    };
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.name.trim() || isSaving) return;

    const quantity = Number.parseFloat(form.quantity.replace(",", "."));
    const price = Number.parseFloat(form.price.replace(",", "."));
    if (Number.isNaN(quantity) || Number.isNaN(price)) {
      setFeedback("Quantidade e valor precisam ser números válidos.");
      return;
    }

    const unit = normalizeUnit(form.unit);

    setIsSaving(true);
    setFeedback(null);
    try {
      const created = await createSupply({
        name: form.name.trim(),
        quantity,
        price,
        unit,
      });
      setSupplies((previous) => [...previous, created]);
      setForm({ name: "", quantity: "", price: "", unit });
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Não foi possível salvar o insumo.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenEdit = (supply: Supply) => {
    setEditingId(supply.id);
    setEditForm({
      name: supply.name,
      quantity: supply.quantity.toFixed(2),
      price: supply.price.toFixed(2),
      unit: normalizeUnit(supply.unit),
    });
    setFeedback(null);
  };

  const handleCloseEdit = () => {
    setEditingId(null);
    setEditForm(null);
    setMovementForm({ quantity: "", unitValue: "", date: todayIso() });
  };

  const handleSaveEdit = async () => {
    if (!editingId || !editForm) return;

    const quantity = Number.parseFloat(editForm.quantity.replace(",", "."));
    const price = Number.parseFloat(editForm.price.replace(",", "."));
    if (Number.isNaN(quantity) || Number.isNaN(price)) {
      setFeedback("Quantidade e valor precisam ser números válidos.");
      return;
    }

    const unit = normalizeUnit(editForm.unit);

    setIsSaving(true);
    setFeedback(null);
    try {
      const updated = await updateSupply(editingId, {
        name: editForm.name.trim(),
        quantity,
        price,
        unit,
      });
      setSupplies((prev) => prev.map((item) => (item.id === editingId ? updated : item)));
      handleCloseEdit();
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Não foi possível atualizar o insumo.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteFromModal = async () => {
    if (!editingId) return;
    alert("Antes de excluir um insumo, certifique-se de que nenhum produto possui ele em sua composição.");
    setFeedback(null);
    try {
      await deleteSupply(editingId);
      setSupplies((previous) => previous.filter((supply) => supply.id !== editingId));
      handleCloseEdit();
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Não foi possível remover o insumo.");
    }
  };

  const handleRegisterMovement = async (movementType: "entrada_insumo" | "saida_insumo") => {
    if (!editingId || !editForm) return;

    const qty = Number.parseFloat(movementForm.quantity.replace(",", "."));
    const unitValue = movementForm.unitValue ? Number.parseFloat(movementForm.unitValue.replace(",", ".")) : null;

    if (Number.isNaN(qty) || qty <= 0) {
      setFeedback("Informe uma quantidade válida para a movimentação.");
      return;
    }

    const targetSupply = supplies.find((s) => s.id === editingId);
    if (!targetSupply) return;

    const currentQty = targetSupply.quantity;
    const newQty = movementType === "entrada_insumo" ? currentQty + qty : currentQty - qty;

    if (newQty < 0) {
      setFeedback("A saída não pode deixar o estoque negativo.");
      return;
    }

    setIsSaving(true);
    setFeedback(null);

    try {
      await createMovimentacao({
        type: movementType,
        supplyId: editingId,
        quantity: qty,
        unit: targetSupply.unit ?? null,
        unitValue: unitValue ?? undefined,
        movementDate: movementForm.date ? new Date(movementForm.date).toISOString() : undefined,
        note: `Movimentação registrada no insumo ${targetSupply.name}`,
      });

      const updatedSupply = await updateSupply(editingId, { quantity: newQty });
      setSupplies((prev) => prev.map((item) => (item.id === editingId ? updatedSupply : item)));
      setMovementForm({ quantity: "", unitValue: "", date: todayIso() });
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Não foi possível registrar a movimentação.");
    } finally {
      setIsSaving(false);
    }
  };

  const metrics = useMemo(() => {
    const registeredItems = supplies.length;
    const totalValue = supplies.reduce((total, current) => total + current.quantity * current.price, 0);
    return { registeredItems, totalValue };
  }, [supplies]);

  return (
    <main style={S.screen}>
      <section style={S.surface}>
        <header style={S.header}>
          <div>
            <p style={S.headline}>Cadastro de Insumos</p>
            <span style={S.supportText}>Os dados agora são salvos diretamente no Supabase.</span>
          </div>
        </header>

        <form style={S.form} onSubmit={handleSubmit}>
          <label style={S.label}>
            Nome do insumo
            <input
              name="name"
              style={S.input}
              placeholder="Ex.: Farinha de trigo"
              value={form.name}
              onChange={(event) => setForm((previous) => ({ ...previous, name: event.target.value }))}
              required
            />
          </label>

          <div style={S.inlineGroup}>
            <label style={S.label}>
              Quantidade
              <input
                name="quantity"
                type="number"
                min="0"
                step="0.01"
                style={S.input}
                placeholder="0"
                value={form.quantity}
                onChange={(event) => setForm((previous) => ({ ...previous, quantity: event.target.value }))}
                required
              />
            </label>

            <label style={S.label}>
              Valor unitário (R$)
              <input
                name="price"
                type="number"
                min="0"
                step="0.01"
                style={S.input}
                placeholder="0,00"
                value={form.price}
                onChange={(event) => setForm((previous) => ({ ...previous, price: event.target.value }))}
                required
              />
            </label>

            <label style={S.label}>
              Unidade
              <select
                name="unit"
                style={S.input}
                value={form.unit}
                onChange={(event) => setForm((previous) => ({ ...previous, unit: event.target.value }))}
                required
              >
                {UNIT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <button type="submit" style={{ ...S.button, opacity: isSaving ? 0.7 : 1 }} disabled={isSaving}>
            {isSaving ? "Salvando..." : "Salvar insumo"}
          </button>
          {feedback && <p style={S.errorMessage}>{feedback}</p>}
        </form>
      </section>

      <section style={S.listCard}>
        <div style={S.metricsRow}>
          <div style={S.metricBox}>
            <strong style={S.metricValue}>{metrics.registeredItems}</strong>
            <span style={S.metricLabel}>insumos cadastrados</span>
          </div>
          <div style={S.metricBox}>
            <strong style={S.metricValue}>
              {metrics.totalValue.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            </strong>
            <span style={S.metricLabel}>valor em estoque</span>
          </div>
        </div>

        {isLoading ? (
          <p style={S.infoMessage}>Carregando insumos...</p>
        ) : supplies.length === 0 ? (
          <p style={S.emptyState}>Nenhum insumo cadastrado ainda.</p>
        ) : (
          <div style={S.tableWrapper}>
            <table style={S.table}>
              <thead>
                <tr>
                  <th style={S.tableHeader}>Nome</th>
                  <th style={S.tableHeader}>Quantidade</th>
                  <th style={S.tableHeader}>Unidade</th>
                  <th style={S.tableHeader}>Valor unitário</th>
                  <th style={S.tableHeader}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {supplies.map((supply) => (
                  <tr key={supply.id}>
                    <td style={S.tableCell}>{supply.name}</td>
                    <td style={S.tableCell}>
                      {supply.quantity.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td style={S.tableCell}>{unitLabel(supply.unit)}</td>
                    <td style={S.tableCell}>
                      {supply.price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                    </td>
                    <td style={S.tableCell}>
                      <button type="button" style={S.deleteButton} onClick={() => handleOpenEdit(supply)}>
                        Editar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {editingId && editForm && (
        <div style={S.modalOverlay}>
          <div style={S.modal}>
            <h3 style={S.modalTitle}>Editar insumo</h3>
            <div style={S.modalContent}>
              <label style={S.label}>
                Nome
                <input
                  style={S.input}
                  value={editForm.name}
                  onChange={(event) => setEditForm((prev) => (prev ? { ...prev, name: event.target.value } : prev))}
                />
              </label>
              <label style={S.label}>
                Quantidade
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  style={S.input}
                  value={editForm.quantity}
                  onChange={(event) => setEditForm((prev) => (prev ? { ...prev, quantity: event.target.value } : prev))}
                />
              </label>
              <label style={S.label}>
                Valor unitário (R$)
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  style={S.input}
                  value={editForm.price}
                  onChange={(event) => setEditForm((prev) => (prev ? { ...prev, price: event.target.value } : prev))}
                />
              </label>
              <label style={S.label}>
                Unidade
                <select
                  style={S.input}
                  value={editForm.unit}
                  onChange={(event) => setEditForm((prev) => (prev ? { ...prev, unit: event.target.value } : prev))}
                >
                  {UNIT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div style={S.modalActions}>
              <button type="button" style={S.modalButtonSecondary} onClick={handleCloseEdit}>
                Cancelar
              </button>
              <button type="button" style={S.modalButtonDanger} onClick={handleDeleteFromModal}>
                Excluir
              </button>
              <button type="button" style={S.modalButtonPrimary} onClick={handleSaveEdit} disabled={isSaving}>
                {isSaving ? "Salvando..." : "Salvar"}
              </button>
            </div>
            <p style={S.modalHint}>
              Antes de excluir um insumo, certifique-se de que nenhum produto possui ele em sua composição.
            </p>

            <div style={S.movementBox}>
              <p style={S.movementTitle}>Registrar movimentação</p>
              <div style={S.movementFields}>
                <label style={S.label}>
                  Quantidade
                  <input
                    style={S.input}
                    type="number"
                    min="0"
                    step="0.01"
                    value={movementForm.quantity}
                    onChange={(e) => setMovementForm((prev) => ({ ...prev, quantity: e.target.value }))}
                  />
                </label>
                <label style={S.label}>
                  Valor unitário (opcional)
                  <input
                    style={S.input}
                    type="number"
                    min="0"
                    step="0.01"
                    value={movementForm.unitValue}
                    onChange={(e) => setMovementForm((prev) => ({ ...prev, unitValue: e.target.value }))}
                  />
                </label>
                <label style={S.label}>
                  Data
                  <input
                    style={S.input}
                    type="date"
                    value={movementForm.date}
                    onChange={(e) => setMovementForm((prev) => ({ ...prev, date: e.target.value }))}
                  />
                </label>
              </div>
              <div style={S.movementActions}>
                <button
                  type="button"
                  style={S.modalButtonPrimary}
                  onClick={() => handleRegisterMovement("entrada_insumo")}
                  disabled={isSaving}
                >
                  Entrada
                </button>
                <button
                  type="button"
                  style={S.modalButtonDanger}
                  onClick={() => handleRegisterMovement("saida_insumo")}
                  disabled={isSaving}
                >
                  Saída
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
