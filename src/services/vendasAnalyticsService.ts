import { supabaseClient } from "./supabase/client";
import type { NumericLike } from "./vendasService";

const TABLE = "venda_itens";

export type VendaItemDetalhado = {
  id: number;
  saleId: number;
  productId: number;
  quantity: number;
  subtotal: number;
  unitPrice: number;
  costUnit?: number | null;
  costTotal?: number | null;
  saleStatus?: string | null;
  salePayment?: string | null;
  saleDate?: string | null;
};

function normalizeNumber(value: NumericLike) {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Number.parseFloat(value.replace(",", "."));
    return Number.isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

export type VendaItensFiltro = {
  startDate?: string;
  endDate?: string;
  status?: string;
  payment?: string;
};

export async function listVendaItensDetalhados(filters: VendaItensFiltro = {}) {
  let query = supabaseClient
    .from(TABLE)
    .select("*, vendas: venda_id(status, forma_pagamento, data_venda)")
    .order("venda_id", { ascending: false });

  const { data, error } = await query;
  if (error) throw new Error(`Erro ao listar itens de venda: ${error.message}`);

  const itens = (data ?? []).map((row: any) => {
    return {
      id: row.id,
      saleId: row.venda_id,
      productId: row.produto_id,
      quantity: normalizeNumber(row.quantidade),
      subtotal: normalizeNumber(row.subtotal),
      unitPrice: normalizeNumber(row.preco_unitario),
      costUnit: row.custo_unitario != null ? normalizeNumber(row.custo_unitario) : null,
      costTotal: row.custo_total != null ? normalizeNumber(row.custo_total) : null,
      saleStatus: row.vendas?.status ?? null,
      salePayment: row.vendas?.forma_pagamento ?? null,
      saleDate: row.vendas?.data_venda ?? null,
    } as VendaItemDetalhado;
  });

  return itens.filter((item) => {
    if (filters.status && item.saleStatus !== filters.status) return false;
    if (filters.payment && item.salePayment !== filters.payment) return false;
    if (filters.startDate && item.saleDate && item.saleDate < filters.startDate) return false;
    if (filters.endDate && item.saleDate && item.saleDate > filters.endDate) return false;
    return true;
  });
}
