import { supabaseClient } from "./supabase/client";
import type { NumericLike } from "./vendasService";

const TABLE = "produto_insumos";

export type ProdutoInsumoRecord = {
  id: number;
  produto_id: number;
  insumo_id: number;
  quantidade: NumericLike;
  created_at?: string | null;
};

export type ProdutoInsumo = {
  id: number;
  productId: number;
  supplyId: number;
  quantity: number;
  createdAt?: string | null;
};

function normalizeNumber(value: NumericLike) {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Number.parseFloat(value.replace(",", "."));
    return Number.isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

function mapRow(row: ProdutoInsumoRecord): ProdutoInsumo {
  return {
    id: row.id,
    productId: row.produto_id,
    supplyId: row.insumo_id,
    quantity: normalizeNumber(row.quantidade),
    createdAt: row.created_at ?? undefined,
  };
}

export async function listProdutoInsumos(productId?: number) {
  let query = supabaseClient.from(TABLE).select("*");
  if (productId) query = query.eq("produto_id", productId);
  const { data, error } = await query;
  if (error) throw new Error(`Erro ao listar composição: ${error.message}`);
  return (data ?? []).map(mapRow);
}

export async function setProdutoInsumos(productId: number, items: { supplyId: number; quantity: number }[]) {
  // remove anteriores e insere novos
  const { error: delError } = await supabaseClient.from(TABLE).delete().eq("produto_id", productId);
  if (delError) throw new Error(`Erro ao limpar composição: ${delError.message}`);

  if (items.length === 0) return [] as ProdutoInsumo[];

  const payload = items.map((i) => ({
    produto_id: productId,
    insumo_id: i.supplyId,
    quantidade: i.quantity,
  }));

  const { data, error } = await supabaseClient.from(TABLE).insert(payload).select("*");
  if (error || !data) throw new Error(`Erro ao salvar composição: ${error?.message ?? "sem retorno"}`);
  return (data as ProdutoInsumoRecord[]).map(mapRow);
}
