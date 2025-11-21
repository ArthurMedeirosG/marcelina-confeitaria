import { supabaseClient } from "./supabase/client";

const TABLE = "produtos";

export type ProdutoRecord = {
  id: number;
  nome: string;
  descricao: string | null;
  custo: number | string | null;
  preco_base: number | string | null;
  ativo: boolean | null;
  updated_at?: string | null;
};

export type Produto = {
  id: number;
  name: string;
  description?: string | null;
  cost: number;
  basePrice: number;
  active: boolean;
  updatedAt?: string | null;
};

function normalizeNumber(value: number | string | null | undefined) {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Number.parseFloat(value.replace(",", "."));
    return Number.isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

function mapRow(row: ProdutoRecord): Produto {
  return {
    id: row.id,
    name: row.nome,
    description: row.descricao,
    cost: normalizeNumber(row.custo),
    basePrice: normalizeNumber(row.preco_base),
    active: Boolean(row.ativo ?? true),
    updatedAt: row.updated_at ?? null,
  };
}

export type CreateProdutoPayload = {
  name: string;
  description?: string;
  cost: number;
  basePrice: number;
  active?: boolean;
};

export async function listProdutos() {
  const { data, error } = await supabaseClient.from(TABLE).select("*").order("id", { ascending: true });

  if (error) throw new Error(`Erro ao listar produtos: ${error.message}`);

  return (data ?? []).map(mapRow);
}

export async function createProduto(payload: CreateProdutoPayload) {
  const insertPayload = {
    nome: payload.name,
    descricao: payload.description?.trim() || null,
    custo: payload.cost.toString(),
    preco_base: payload.basePrice.toString(),
    ativo: payload.active ?? true,
  };

  const { data, error } = await supabaseClient.from(TABLE).insert(insertPayload).select("*").single();

  if (error || !data) {
    throw new Error(`Erro ao criar produto: ${error?.message ?? "sem retorno"}`);
  }

  return mapRow(data as ProdutoRecord);
}

export async function deleteProduto(id: number) {
  const { error } = await supabaseClient.from(TABLE).delete().eq("id", id);
  if (error) throw new Error(`Erro ao remover produto: ${error.message}`);
}
