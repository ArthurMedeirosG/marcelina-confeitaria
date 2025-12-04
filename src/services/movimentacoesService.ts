import { supabaseClient } from "./supabase/client";

type NumericLike = number | string | null;

function normalizeNumber(value: NumericLike) {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Number.parseFloat(value.replace(",", "."));
    return Number.isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

const TABLE = "movimentacoes";

export type MovimentoRecord = {
  id: number;
  tipo: string;
  insumo_id: number | null;
  produto_id: number | null;
  venda_id: number | null;
  quantidade: NumericLike;
  unidade: string | null;
  valor_unitario: NumericLike;
  observacao: string | null;
  data_movimentacao?: string | null;
  created_at?: string | null;
};

export type Movimento = {
  id: number;
  type: string;
  supplyId?: number | null;
  productId?: number | null;
  saleId?: number | null;
  quantity: number;
  unit?: string | null;
  unitValue?: number | null;
  note?: string | null;
  movementDate?: string | null;
  createdAt?: string | null;
};

export type MovimentoFilters = {
  type?: string;
  supplyId?: number;
  productId?: number;
  saleId?: number;
  startDate?: string; // ISO
  endDate?: string; // ISO
};

export type CreateMovimentoPayload = {
  type: string;
  supplyId?: number;
  productId?: number;
  saleId?: number;
  quantity: number;
  unit?: string | null;
  unitValue?: number | null;
  note?: string;
  movementDate?: string; // ISO
};

function mapRow(row: MovimentoRecord): Movimento {
  return {
    id: row.id,
    type: row.tipo,
    supplyId: row.insumo_id,
    productId: row.produto_id,
    saleId: row.venda_id,
    quantity: normalizeNumber(row.quantidade),
    unit: row.unidade,
    unitValue: row.valor_unitario !== null ? normalizeNumber(row.valor_unitario) : null,
    note: row.observacao,
    movementDate: row.data_movimentacao ?? null,
    createdAt: row.created_at ?? null,
  };
}

export async function listMovimentacoes(filters: MovimentoFilters = {}) {
  let query = supabaseClient.from(TABLE).select("*").order("data_movimentacao", { ascending: false });

  if (filters.type) query = query.eq("tipo", filters.type);
  if (filters.supplyId) query = query.eq("insumo_id", filters.supplyId);
  if (filters.productId) query = query.eq("produto_id", filters.productId);
  if (filters.saleId) query = query.eq("venda_id", filters.saleId);
  if (filters.startDate) query = query.gte("data_movimentacao", filters.startDate);
  if (filters.endDate) query = query.lte("data_movimentacao", filters.endDate);

  const { data, error } = await query;
  if (error) throw new Error(`Erro ao listar movimentações: ${error.message}`);

  return (data ?? []).map(mapRow);
}

export async function createMovimentacao(payload: CreateMovimentoPayload) {
  const insertPayload = {
    tipo: payload.type,
    insumo_id: payload.supplyId ?? null,
    produto_id: payload.productId ?? null,
    venda_id: payload.saleId ?? null,
    quantidade: payload.quantity,
    unidade: payload.unit ?? null,
    valor_unitario: payload.unitValue ?? null,
    observacao: payload.note?.trim() || null,
    data_movimentacao: payload.movementDate ?? new Date().toISOString(),
  };

  const { data, error } = await supabaseClient.from(TABLE).insert(insertPayload).select("*").single();
  if (error || !data) throw new Error(`Erro ao criar movimentação: ${error?.message ?? "sem retorno"}`);

  return mapRow(data as MovimentoRecord);
}
