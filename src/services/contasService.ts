import { supabaseClient } from "./supabase/client";

const TABLE = "contas";

type NumericLike = number | string | null;

function normalizeNumber(value: NumericLike) {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Number.parseFloat(value.replace(",", "."));
    return Number.isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

export type ContaRecord = {
  id: number;
  tipo: string;
  status: string;
  titulo: string;
  descricao: string | null;
  valor: NumericLike;
  data_vencimento: string;
  data_pagamento: string | null;
  recorrente: boolean;
  recorrencia_tipo: string | null;
  recorrencia_dia: number | null;
  data_ultima_geracao: string | null;
  ativo: boolean | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type Conta = {
  id: number;
  type: string;
  status: string;
  title: string;
  description?: string | null;
  amount: number;
  dueDate: string;
  paymentDate?: string | null;
  isRecurring: boolean;
  recurrenceType?: string | null;
  recurrenceDay?: number | null;
  lastGeneratedDate?: string | null;
  active: boolean;
  createdAt?: string | null;
  updatedAt?: string | null;
};

function mapRow(row: ContaRecord): Conta {
  return {
    id: row.id,
    type: row.tipo,
    status: row.status,
    title: row.titulo,
    description: row.descricao,
    amount: normalizeNumber(row.valor),
    dueDate: row.data_vencimento,
    paymentDate: row.data_pagamento ?? null,
    isRecurring: Boolean(row.recorrente),
    recurrenceType: row.recorrencia_tipo ?? null,
    recurrenceDay: row.recorrencia_dia ?? null,
    lastGeneratedDate: row.data_ultima_geracao ?? null,
    active: Boolean(row.ativo ?? true),
    createdAt: row.created_at ?? null,
    updatedAt: row.updated_at ?? null,
  };
}

export type CreateContaPayload = {
  type: "pagar" | "receber";
  status?: "aberta" | "pendente" | "concluida";
  title: string;
  description?: string;
  amount: number;
  dueDate: string;
  isRecurring?: boolean;
  recurrenceType?: "mensal";
  recurrenceDay?: number | null;
};

export async function listContas() {
  const { data, error } = await supabaseClient
    .from(TABLE)
    .select("*")
    .order("data_vencimento", { ascending: true });

  if (error) {
    throw new Error(`Erro ao listar contas: ${error.message}`);
  }

  return (data ?? []).map((row) => mapRow(row as ContaRecord));
}

export async function createConta(payload: CreateContaPayload) {
  const isRecurring = payload.isRecurring ?? false;

  const insertPayload = {
    tipo: payload.type,
    status: payload.status ?? "aberta",
    titulo: payload.title,
    descricao: payload.description?.trim() || null,
    valor: payload.amount.toString(),
    data_vencimento: payload.dueDate,
    recorrente: isRecurring,
    recorrencia_tipo: isRecurring ? payload.recurrenceType ?? "mensal" : null,
    recorrencia_dia: isRecurring ? payload.recurrenceDay ?? null : null,
    ativo: true,
  };

  const { data, error } = await supabaseClient.from(TABLE).insert(insertPayload).select("*").single();

  if (error || !data) {
    throw new Error(`Erro ao criar conta: ${error?.message ?? "sem retorno"}`);
  }

  return mapRow(data as ContaRecord);
}

export type UpdateContaPayload = {
  type?: "pagar" | "receber";
  status?: "aberta" | "pendente" | "concluida";
  title?: string;
  description?: string | null;
  amount?: number;
  dueDate?: string;
  paymentDate?: string | null;
  isRecurring?: boolean;
  recurrenceType?: "mensal" | null;
  recurrenceDay?: number | null;
  active?: boolean;
};

export async function updateConta(id: number, payload: UpdateContaPayload) {
  const updatePayload: Record<string, unknown> = {
    ...(payload.type !== undefined ? { tipo: payload.type } : {}),
    ...(payload.status !== undefined ? { status: payload.status } : {}),
    ...(payload.title !== undefined ? { titulo: payload.title } : {}),
    ...(payload.description !== undefined ? { descricao: payload.description ?? null } : {}),
    ...(payload.amount !== undefined ? { valor: payload.amount.toString() } : {}),
    ...(payload.dueDate !== undefined ? { data_vencimento: payload.dueDate } : {}),
    ...(payload.paymentDate !== undefined ? { data_pagamento: payload.paymentDate } : {}),
    ...(payload.active !== undefined ? { ativo: payload.active } : {}),
  };

  if (payload.isRecurring !== undefined) {
    updatePayload.recorrente = payload.isRecurring;
    updatePayload.recorrencia_tipo = payload.isRecurring ? payload.recurrenceType ?? "mensal" : null;
    updatePayload.recorrencia_dia = payload.isRecurring ? payload.recurrenceDay ?? null : null;
  } else {
    if (payload.recurrenceType !== undefined) {
      updatePayload.recorrencia_tipo = payload.recurrenceType;
    }
    if (payload.recurrenceDay !== undefined) {
      updatePayload.recorrencia_dia = payload.recurrenceDay;
    }
  }

  const { data, error } = await supabaseClient.from(TABLE).update(updatePayload).eq("id", id).select("*").single();

  if (error || !data) {
    throw new Error(`Erro ao atualizar conta: ${error?.message ?? "sem retorno"}`);
  }

  return mapRow(data as ContaRecord);
}
