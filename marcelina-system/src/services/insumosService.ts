import { supabaseClient } from "./supabase/client";

const TABLE = "insumos";

export type SupplyRecord = {
  id: number;
  nome: string;
  quantidade: number | null;
  valor: number | string | null;
  unidade: string | null;
  created_at?: string;
};

export type Supply = {
  id: number;
  name: string;
  quantity: number;
  price: number;
  unit?: string | null;
  createdAt?: string;
};

function normalizeNumber(value: number | string | null | undefined) {
  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number.parseFloat(value.replace(",", "."));
    return Number.isNaN(parsed) ? 0 : parsed;
  }

  return 0;
}

function mapRow(row: SupplyRecord): Supply {
  return {
    id: row.id,
    name: row.nome,
    quantity: normalizeNumber(row.quantidade),
    price: normalizeNumber(row.valor),
    unit: row.unidade,
    createdAt: row.created_at,
  };
}

export type CreateSupplyPayload = {
  name: string;
  quantity: number;
  price: number;
  unit?: string | null;
};

export type UpdateSupplyPayload = {
  name?: string;
  quantity?: number;
  price?: number;
  unit?: string | null;
};

export async function listSupplies() {
  const { data, error } = await supabaseClient
    .from(TABLE)
    .select("*")
    .order("id", { ascending: true });

  if (error) {
    throw new Error(`Erro ao listar insumos: ${error.message}`);
  }

  return (data ?? []).map(mapRow);
}

export async function createSupply(payload: CreateSupplyPayload) {
  const insertPayload = {
    nome: payload.name,
    quantidade: Math.trunc(payload.quantity),
    valor: payload.price.toString(),
    unidade: payload.unit?.trim() || null,
  };

  const { data, error } = await supabaseClient.from(TABLE).insert(insertPayload).select("*").single();

  if (error || !data) {
    throw new Error(`Erro ao criar insumo: ${error?.message ?? "sem retorno"}`);
  }

  return mapRow(data as SupplyRecord);
}

export async function deleteSupply(id: number) {
  const { error } = await supabaseClient.from(TABLE).delete().eq("id", id);

  if (error) {
    throw new Error(`Erro ao remover insumo: ${error.message}`);
  }
}

export async function updateSupply(id: number, payload: UpdateSupplyPayload) {
  const updatePayload = {
    ...(payload.name !== undefined ? { nome: payload.name } : {}),
    ...(payload.quantity !== undefined ? { quantidade: payload.quantity } : {}),
    ...(payload.price !== undefined ? { valor: payload.price } : {}),
    ...(payload.unit !== undefined ? { unidade: payload.unit ?? null } : {}),
  };

  const { data, error } = await supabaseClient.from(TABLE).update(updatePayload).eq("id", id).select("*").single();

  if (error || !data) {
    throw new Error(`Erro ao atualizar insumo: ${error?.message ?? "sem retorno"}`);
  }

  return mapRow(data as SupplyRecord);
}

