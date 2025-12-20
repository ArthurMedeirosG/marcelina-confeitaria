import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import * as S from "./style";
import { theme } from "../../theme";
import { createConta, listContas, updateConta, type Conta } from "../../services/contasService";

type ContaForm = {
  type: "pagar" | "receber";
  status: "aberta" | "pendente" | "concluida";
  title: string;
  description: string;
  amount: string;
  dueDate: string;
  isRecurring: boolean;
  recurrenceDay: string;
};

type EditForm = ContaForm & {
  paymentDate: string;
};

const STATUS_LABELS: Record<ContaForm["status"], string> = {
  aberta: "Aberta",
  pendente: "Pendente",
  concluida: "Concluida",
};

const TYPE_LABELS: Record<ContaForm["type"], string> = {
  pagar: "Pagar",
  receber: "Receber",
};

function toCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function toDateLabel(dateValue?: string | null) {
  if (!dateValue) return "--";
  const parts = dateValue.split("-");
  if (parts.length === 3) {
    const [year, month, day] = parts;
    return `${day}/${month}/${year}`;
  }
  const parsed = new Date(dateValue);
  return Number.isNaN(parsed.getTime()) ? "--" : parsed.toLocaleDateString("pt-BR");
}

function getDayFromDate(dateValue: string) {
  const parts = dateValue.split("-");
  if (parts.length !== 3) return null;
  const day = Number.parseInt(parts[2], 10);
  return Number.isNaN(day) ? null : day;
}

function parseRecurrenceDay(input: string, fallbackDate: string) {
  if (input) {
    const parsed = Number.parseInt(input, 10);
    return Number.isNaN(parsed) ? null : parsed;
  }
  return fallbackDate ? getDayFromDate(fallbackDate) : null;
}

function sortByDueDate(items: Conta[]) {
  return [...items].sort((a, b) => a.dueDate.localeCompare(b.dueDate));
}

export function Accounts() {
  const [contas, setContas] = useState<Conta[]>([]);
  const [form, setForm] = useState<ContaForm>({
    type: "receber",
    status: "aberta",
    title: "",
    description: "",
    amount: "",
    dueDate: "",
    isRecurring: false,
    recurrenceDay: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [editing, setEditing] = useState<Conta | null>(null);
  const [editForm, setEditForm] = useState<EditForm>({
    type: "receber",
    status: "aberta",
    title: "",
    description: "",
    amount: "",
    dueDate: "",
    isRecurring: false,
    recurrenceDay: "",
    paymentDate: "",
  });
  const [editFeedback, setEditFeedback] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    let active = true;

    async function fetchData() {
      setIsLoading(true);
      setFeedback(null);
      try {
        const list = await listContas();
        if (active) setContas(sortByDueDate(list));
      } catch (error) {
        if (active) setFeedback(error instanceof Error ? error.message : "Erro ao carregar contas.");
      } finally {
        if (active) setIsLoading(false);
      }
    }

    fetchData();
    return () => {
      active = false;
    };
  }, []);

  const metrics = useMemo(() => {
    const total = contas.length;
    const abertas = contas.filter((item) => item.status === "aberta").length;
    const pendentes = contas.filter((item) => item.status === "pendente").length;
    const concluidas = contas.filter((item) => item.status === "concluida").length;
    return { total, abertas, pendentes, concluidas };
  }, [contas]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSaving) return;

    if (!form.title.trim()) {
      setFeedback("Informe um titulo para a conta.");
      return;
    }

    const amountValue = Number.parseFloat(form.amount.replace(",", "."));
    if (Number.isNaN(amountValue)) {
      setFeedback("Informe um valor valido.");
      return;
    }

    if (!form.dueDate) {
      setFeedback("Informe a data de vencimento.");
      return;
    }

    const recurrenceDay = form.isRecurring ? parseRecurrenceDay(form.recurrenceDay, form.dueDate) : null;

    if (form.isRecurring && recurrenceDay !== null && (recurrenceDay < 1 || recurrenceDay > 31)) {
      setFeedback("Informe um dia de recorrencia entre 1 e 31.");
      return;
    }

    setIsSaving(true);
    setFeedback(null);
    try {
      const created = await createConta({
        type: form.type,
        status: form.status,
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        amount: amountValue,
        dueDate: form.dueDate,
        isRecurring: form.isRecurring,
        recurrenceType: form.isRecurring ? "mensal" : undefined,
        recurrenceDay: recurrenceDay ?? null,
      });
      setContas((prev) => sortByDueDate([...prev, created]));
      setForm({
        type: "receber",
        status: "aberta",
        title: "",
        description: "",
        amount: "",
        dueDate: "",
        isRecurring: false,
        recurrenceDay: "",
      });
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Erro ao salvar conta.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenEdit = (conta: Conta) => {
    setEditing(conta);
    setEditFeedback(null);
    setEditForm({
      type: conta.type as ContaForm["type"],
      status: conta.status as ContaForm["status"],
      title: conta.title,
      description: conta.description ?? "",
      amount: conta.amount.toString(),
      dueDate: conta.dueDate,
      isRecurring: conta.isRecurring,
      recurrenceDay: conta.recurrenceDay ? String(conta.recurrenceDay) : "",
      paymentDate: conta.paymentDate ?? "",
    });
  };

  const handleCloseEdit = () => {
    setEditing(null);
    setEditFeedback(null);
  };

  const handleSaveEdit = async () => {
    if (!editing || isUpdating) return;

    if (!editForm.title.trim()) {
      setEditFeedback("Informe um titulo para a conta.");
      return;
    }

    const amountValue = Number.parseFloat(editForm.amount.replace(",", "."));
    if (Number.isNaN(amountValue)) {
      setEditFeedback("Informe um valor valido.");
      return;
    }

    if (!editForm.dueDate) {
      setEditFeedback("Informe a data de vencimento.");
      return;
    }

    const recurrenceDay = editForm.isRecurring ? parseRecurrenceDay(editForm.recurrenceDay, editForm.dueDate) : null;

    if (editForm.isRecurring && recurrenceDay !== null && (recurrenceDay < 1 || recurrenceDay > 31)) {
      setEditFeedback("Informe um dia de recorrencia entre 1 e 31.");
      return;
    }

    const paymentDate =
      editForm.status === "concluida" ? (editForm.paymentDate ? editForm.paymentDate : null) : null;

    setIsUpdating(true);
    setEditFeedback(null);
    try {
      const updated = await updateConta(editing.id, {
        type: editForm.type,
        status: editForm.status,
        title: editForm.title.trim(),
        description: editForm.description.trim() || null,
        amount: amountValue,
        dueDate: editForm.dueDate,
        paymentDate,
        isRecurring: editForm.isRecurring,
        recurrenceType: editForm.isRecurring ? "mensal" : null,
        recurrenceDay: recurrenceDay ?? null,
      });
      setContas((prev) => sortByDueDate(prev.map((item) => (item.id === updated.id ? updated : item))));
      handleCloseEdit();
    } catch (error) {
      setEditFeedback(error instanceof Error ? error.message : "Erro ao atualizar conta.");
    } finally {
      setIsUpdating(false);
    }
  };

  const statusColor = (status: ContaForm["status"]) => {
    if (status === "aberta") return theme.colors.feedback.success;
    if (status === "pendente") return theme.colors.feedback.error;
    return theme.colors.neutrals.textPrimary;
  };

  return (
    <main style={S.screen}>
      <section style={S.surface}>
        <header style={S.header}>
          <div>
            <p style={S.headline}>Contas a pagar/receber</p>
            <span style={S.supportText}>
              Registre contas recorrentes e acompanhe o status com lembretes visuais.
            </span>
          </div>
        </header>

        <form style={S.form} onSubmit={handleSubmit}>
          <div style={S.inlineGroup}>
            <label style={S.label}>
              Tipo
              <select
                style={S.input}
                value={form.type}
                onChange={(event) => setForm((prev) => ({ ...prev, type: event.target.value as ContaForm["type"] }))}
              >
                <option value="pagar">Pagar</option>
                <option value="receber">Receber</option>
              </select>
            </label>

            <label style={S.label}>
              Status inicial
              <select
                style={S.input}
                value={form.status}
                onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value as ContaForm["status"] }))}
              >
                <option value="aberta">Aberta</option>
                <option value="pendente">Pendente</option>
                <option value="concluida">Concluida</option>
              </select>
            </label>

            <label style={S.label}>
              Valor (R$)
              <input
                type="number"
                min="0"
                step="0.01"
                style={S.input}
                placeholder="0,00"
                value={form.amount}
                onChange={(event) => setForm((prev) => ({ ...prev, amount: event.target.value }))}
                required
              />
            </label>
          </div>

          <label style={S.label}>
            Titulo da conta
            <input
              style={S.input}
              placeholder="Ex.: Aluguel, Boleto cliente"
              value={form.title}
              onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
              required
            />
          </label>

          <label style={S.label}>
            Descricao
            <textarea
              style={S.textarea}
              placeholder="Detalhes adicionais"
              value={form.description}
              onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
            />
          </label>

          <div style={S.inlineGroup}>
            <label style={S.label}>
              Data de vencimento
              <input
                type="date"
                style={S.input}
                value={form.dueDate}
                onChange={(event) => setForm((prev) => ({ ...prev, dueDate: event.target.value }))}
                required
              />
            </label>
          </div>

          <div style={S.toggleRow}>
            <input
              id="recorrente"
              type="checkbox"
              checked={form.isRecurring}
              onChange={(event) => setForm((prev) => ({ ...prev, isRecurring: event.target.checked }))}
            />
            <label htmlFor="recorrente" style={{ ...S.label, margin: 0 }}>
              Conta recorrente mensal
            </label>
          </div>

          {form.isRecurring && (
            <div style={S.inlineGroup}>
              <label style={S.label}>
                Dia da recorrencia (1-31)
                <input
                  type="number"
                  min="1"
                  max="31"
                  style={S.input}
                  placeholder="Ex.: 10"
                  value={form.recurrenceDay}
                  onChange={(event) => setForm((prev) => ({ ...prev, recurrenceDay: event.target.value }))}
                />
              </label>
            </div>
          )}

          <button type="submit" style={{ ...S.button, opacity: isSaving ? 0.7 : 1 }} disabled={isSaving}>
            {isSaving ? "Salvando..." : "Registrar conta"}
          </button>
          {feedback && <p style={S.errorMessage}>{feedback}</p>}
        </form>
      </section>

      <section style={S.board}>
        <div style={S.summaryRow}>
          <div style={S.summaryCard}>
            <strong style={S.summaryValue}>{metrics.total}</strong>
            <span style={S.summaryLabel}>contas registradas</span>
          </div>
          <div style={S.summaryCard}>
            <strong style={S.summaryValue}>{metrics.abertas}</strong>
            <span style={S.summaryLabel}>abertas</span>
          </div>
          <div style={S.summaryCard}>
            <strong style={S.summaryValue}>{metrics.pendentes}</strong>
            <span style={S.summaryLabel}>pendentes</span>
          </div>
          <div style={S.summaryCard}>
            <strong style={S.summaryValue}>{metrics.concluidas}</strong>
            <span style={S.summaryLabel}>concluidas</span>
          </div>
        </div>

        {isLoading ? (
          <p style={S.infoMessage}>Carregando contas...</p>
        ) : contas.length === 0 ? (
          <p style={S.emptyState}>Nenhuma conta cadastrada ainda.</p>
        ) : (
          <div style={S.cardsGrid}>
            {contas.map((conta) => (
              <article key={conta.id} style={S.card}>
                <div style={S.cardHeader}>
                  <span style={S.typeBadge}>{TYPE_LABELS[conta.type as ContaForm["type"]]}</span>
                  <div style={S.statusRow}>
                    <span style={{ ...S.statusDot, backgroundColor: statusColor(conta.status as ContaForm["status"]) }} />
                    <span>{STATUS_LABELS[conta.status as ContaForm["status"]]}</span>
                  </div>
                </div>
                <div>
                  <p style={S.title}>{conta.title}</p>
                  {conta.description && <p style={S.metaText}>{conta.description}</p>}
                </div>
                <div>
                  <p style={S.metaText}>Vencimento: {toDateLabel(conta.dueDate)}</p>
                  {conta.paymentDate && <p style={S.metaText}>Pagamento: {toDateLabel(conta.paymentDate)}</p>}
                </div>
                <p style={S.valueText}>{toCurrency(conta.amount)}</p>
                <span style={S.tag}>
                  {conta.isRecurring
                    ? `Recorrente mensal dia ${conta.recurrenceDay ?? "--"}`
                    : "Conta unica"}
                </span>
                <div style={S.cardActions}>
                  <button type="button" style={S.editButton} onClick={() => handleOpenEdit(conta)}>
                    Editar
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {editing && (
        <div style={S.modalOverlay}>
          <div style={S.modal}>
            <h3 style={S.modalTitle}>Editar conta</h3>
            <div style={S.modalContent}>
              <div style={S.inlineGroup}>
                <label style={S.label}>
                  Tipo
                  <select
                    style={S.input}
                    value={editForm.type}
                    onChange={(event) =>
                      setEditForm((prev) => ({ ...prev, type: event.target.value as ContaForm["type"] }))
                    }
                  >
                    <option value="pagar">Pagar</option>
                    <option value="receber">Receber</option>
                  </select>
                </label>

                <label style={S.label}>
                  Status
                  <select
                    style={S.input}
                    value={editForm.status}
                    onChange={(event) =>
                      setEditForm((prev) => ({ ...prev, status: event.target.value as ContaForm["status"] }))
                    }
                  >
                    <option value="aberta">Aberta</option>
                    <option value="pendente">Pendente</option>
                    <option value="concluida">Concluida</option>
                  </select>
                </label>

                <label style={S.label}>
                  Valor (R$)
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    style={S.input}
                    value={editForm.amount}
                    onChange={(event) => setEditForm((prev) => ({ ...prev, amount: event.target.value }))}
                  />
                </label>
              </div>

              <label style={S.label}>
                Titulo
                <input
                  style={S.input}
                  value={editForm.title}
                  onChange={(event) => setEditForm((prev) => ({ ...prev, title: event.target.value }))}
                />
              </label>

              <label style={S.label}>
                Descricao
                <textarea
                  style={S.textarea}
                  value={editForm.description}
                  onChange={(event) => setEditForm((prev) => ({ ...prev, description: event.target.value }))}
                />
              </label>

              <div style={S.inlineGroup}>
                <label style={S.label}>
                  Data de vencimento
                  <input
                    type="date"
                    style={S.input}
                    value={editForm.dueDate}
                    onChange={(event) => setEditForm((prev) => ({ ...prev, dueDate: event.target.value }))}
                  />
                </label>

                <label style={S.label}>
                  Data de pagamento
                  <input
                    type="date"
                    style={S.input}
                    value={editForm.paymentDate}
                    onChange={(event) => setEditForm((prev) => ({ ...prev, paymentDate: event.target.value }))}
                    disabled={editForm.status !== "concluida"}
                  />
                </label>
              </div>

              <div style={S.toggleRow}>
                <input
                  id="recorrente-edit"
                  type="checkbox"
                  checked={editForm.isRecurring}
                  onChange={(event) => setEditForm((prev) => ({ ...prev, isRecurring: event.target.checked }))}
                />
                <label htmlFor="recorrente-edit" style={{ ...S.label, margin: 0 }}>
                  Conta recorrente mensal
                </label>
              </div>

              {editForm.isRecurring && (
                <div style={S.inlineGroup}>
                  <label style={S.label}>
                    Dia da recorrencia (1-31)
                    <input
                      type="number"
                      min="1"
                      max="31"
                      style={S.input}
                      value={editForm.recurrenceDay}
                      onChange={(event) => setEditForm((prev) => ({ ...prev, recurrenceDay: event.target.value }))}
                    />
                  </label>
                </div>
              )}
            </div>

            <div style={S.modalActions}>
              <button type="button" style={S.modalButtonSecondary} onClick={handleCloseEdit}>
                Cancelar
              </button>
              <button type="button" style={S.modalButtonPrimary} onClick={handleSaveEdit} disabled={isUpdating}>
                {isUpdating ? "Salvando..." : "Salvar alteracoes"}
              </button>
            </div>
            {editFeedback && <p style={S.modalHint}>{editFeedback}</p>}
          </div>
        </div>
      )}
    </main>
  );
}
