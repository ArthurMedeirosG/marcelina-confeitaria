import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import * as S from "./style";
import { createSupply, deleteSupply, listSupplies, updateSupply, type Supply } from "../../services/insumosService";

type SupplyForm = {
  name: string;
  quantity: string;
  price: string;
  unit: string;
};

const UNIT_SUGGESTIONS = ["unidade", "kg", "g", "l", "ml", "caixa", "pacote", "litro"];

export function SupplyRegistration() {
  const [supplies, setSupplies] = useState<Supply[]>([]);
  const [form, setForm] = useState<SupplyForm>({ name: "", quantity: "", price: "", unit: "unidade" });
  const [editForm, setEditForm] = useState<SupplyForm | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
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
        if (active) {
          setSupplies(items);
        }
      } catch (error) {
        if (active) {
          setFeedback(error instanceof Error ? error.message : "Erro ao carregar os insumos.");
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    fetchSupplies();

    return () => {
      active = false;
    };
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.name.trim() || isSaving) {
      return;
    }

    const quantity = Number.parseInt(form.quantity, 10);
    const price = Number.parseFloat(form.price.replace(",", "."));

    if (Number.isNaN(quantity) || Number.isNaN(price)) {
      setFeedback("Quantidade e valor precisam ser números válidos.");
      return;
    }

    const unit = form.unit.trim();
    if (!unit) {
      setFeedback("Informe a unidade (ex.: unidade, kg, litro).");
      return;
    }

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
      quantity: supply.quantity.toString(),
      price: supply.price.toString(),
      unit: supply.unit ?? "",
    });
    setFeedback(null);
  };

  const handleCloseEdit = () => {
    setEditingId(null);
    setEditForm(null);
  };

  const handleSaveEdit = async () => {
    if (!editingId || !editForm) return;

    const quantity = Number.parseInt(editForm.quantity, 10);
    const price = Number.parseFloat(editForm.price.replace(",", "."));

    if (Number.isNaN(quantity) || Number.isNaN(price)) {
      setFeedback("Quantidade e valor precisam ser números válidos.");
      return;
    }

    const unit = editForm.unit.trim();
    if (!unit) {
      setFeedback("Informe a unidade (ex.: unidade, kg, litro).");
      return;
    }

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
                step="1"
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
              <input
                name="unit"
                list="unit-options"
                style={S.input}
                placeholder="unidade, kg, litro..."
                value={form.unit}
                onChange={(event) => setForm((previous) => ({ ...previous, unit: event.target.value }))}
                required
              />
            </label>
          </div>

          <datalist id="unit-options">
            {UNIT_SUGGESTIONS.map((option) => (
              <option key={option} value={option} />
            ))}
          </datalist>

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
                    <td style={S.tableCell}>{supply.quantity}</td>
                    <td style={S.tableCell}>{supply.unit ?? "-"}</td>
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
                  step="1"
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
                <input
                  style={S.input}
                  value={editForm.unit}
                  onChange={(event) => setEditForm((prev) => (prev ? { ...prev, unit: event.target.value } : prev))}
                />
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
          </div>
        </div>
      )}
    </main>
  );
}
