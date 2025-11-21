import { supabaseClient } from "./supabase/client";

const VENDAS_TABLE = "vendas";
const ITENS_TABLE = "venda_itens";

type NumericLike = number | string | null;

function normalizeNumber(value: NumericLike) {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Number.parseFloat(value.replace(",", "."));
    return Number.isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

export type VendaRecord = {
  id: number;
  cliente_nome: string | null;
  observacao: string | null;
  valor_total: NumericLike;
  forma_pagamento: string | null;
  status: string | null;
  data_venda?: string | null;
  updated_at?: string | null;
  venda_itens?: VendaItemRecord[];
};

export type Venda = {
  id: number;
  customerName?: string | null;
  notes?: string | null;
  total: number;
  paymentMethod?: string | null;
  status?: string | null;
  saleDate?: string | null;
  updatedAt?: string | null;
  items?: VendaItem[];
};

export type VendaItemRecord = {
  id: number;
  venda_id: number;
  produto_id: number;
  quantidade: NumericLike;
  preco_unitario: NumericLike;
  subtotal: NumericLike;
  created_at?: string | null;
};

export type VendaItem = {
  id: number;
  saleId: number;
  productId: number;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  createdAt?: string | null;
};

function mapItem(row: VendaItemRecord): VendaItem {
  return {
    id: row.id,
    saleId: row.venda_id,
    productId: row.produto_id,
    quantity: normalizeNumber(row.quantidade),
    unitPrice: normalizeNumber(row.preco_unitario),
    subtotal: normalizeNumber(row.subtotal),
    createdAt: row.created_at ?? undefined,
  };
}

function mapVenda(row: VendaRecord): Venda {
  return {
    id: row.id,
    customerName: row.cliente_nome,
    notes: row.observacao,
    total: normalizeNumber(row.valor_total),
    paymentMethod: row.forma_pagamento,
    status: row.status,
    saleDate: row.data_venda ?? undefined,
    updatedAt: row.updated_at ?? undefined,
    items: row.venda_itens?.map(mapItem),
  };
}

export type CreateVendaItemInput = {
  productId: number;
  quantity: number;
  unitPrice: number;
};

export type CreateVendaPayload = {
  customerName?: string;
  notes?: string;
  paymentMethod?: string;
  status?: string;
  saleDate?: string;
  items: CreateVendaItemInput[];
};

export type UpdateVendaPayload = {
  customerName?: string;
  notes?: string;
  paymentMethod?: string;
  status?: string;
  saleDate?: string;
};

export async function listVendas() {
  const { data, error } = await supabaseClient
    .from(VENDAS_TABLE)
    .select("*, venda_itens(*)")
    .order("data_venda", { ascending: false })
    .order("id", { ascending: false });

  if (error) throw new Error(`Erro ao listar vendas: ${error.message}`);

  return (data ?? []).map(mapVenda);
}

export async function createVenda(payload: CreateVendaPayload) {
  if (!payload.items || payload.items.length === 0) {
    throw new Error("Inclua ao menos um produto na venda.");
  }

  const total = payload.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const saleDate = payload.saleDate ?? new Date().toISOString();

  const { data: vendaData, error: vendaError } = await supabaseClient
    .from(VENDAS_TABLE)
    .insert({
      cliente_nome: payload.customerName?.trim() || null,
      observacao: payload.notes?.trim() || null,
      valor_total: total,
      forma_pagamento: payload.paymentMethod?.trim() || null,
      status: payload.status?.trim() || "aberta",
      data_venda: saleDate,
      updated_at: new Date().toISOString(),
    })
    .select("*")
    .single();

  if (vendaError || !vendaData) {
    throw new Error(`Erro ao criar venda: ${vendaError?.message ?? "sem retorno"}`);
  }

  const vendaId = vendaData.id as number;

  const itensPayload = payload.items.map((item) => ({
    venda_id: vendaId,
    produto_id: item.productId,
    quantidade: item.quantity,
    preco_unitario: item.unitPrice,
    subtotal: item.quantity * item.unitPrice,
  }));

  const { data: itensData, error: itensError } = await supabaseClient
    .from(ITENS_TABLE)
    .insert(itensPayload)
    .select("*");

  if (itensError || !itensData) {
    throw new Error(`Erro ao criar itens da venda: ${itensError?.message ?? "sem retorno"}`);
  }

  return mapVenda({ ...vendaData, venda_itens: itensData as VendaItemRecord[] } as VendaRecord);
}

export async function deleteVenda(id: number) {
  const { error } = await supabaseClient.from(VENDAS_TABLE).delete().eq("id", id);
  if (error) throw new Error(`Erro ao remover venda: ${error.message}`);
}

export async function updateVenda(id: number, payload: UpdateVendaPayload) {
  const updatePayload = {
    ...(payload.customerName !== undefined ? { cliente_nome: payload.customerName?.trim() || null } : {}),
    ...(payload.notes !== undefined ? { observacao: payload.notes?.trim() || null } : {}),
    ...(payload.paymentMethod !== undefined ? { forma_pagamento: payload.paymentMethod?.trim() || null } : {}),
    ...(payload.status !== undefined ? { status: payload.status?.trim() || null } : {}),
    ...(payload.saleDate !== undefined ? { data_venda: payload.saleDate } : {}),
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabaseClient
    .from(VENDAS_TABLE)
    .update(updatePayload)
    .eq("id", id)
    .select("*, venda_itens(*)")
    .single();

  if (error || !data) {
    throw new Error(`Erro ao atualizar venda: ${error?.message ?? "sem retorno"}`);
  }

  return mapVenda(data as VendaRecord);
}
