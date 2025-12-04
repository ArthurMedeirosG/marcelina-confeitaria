import { supabaseClient } from './supabase/client';
import { createMovimentacao } from './movimentacoesService';

const VENDAS_TABLE = "vendas";
const ITENS_TABLE = "venda_itens";

type NumericLike = number | string | null;
export type { NumericLike };

function normalizeNumber(value: NumericLike) {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Number.parseFloat(value.replace(",", "."));
    return Number.isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

type Composition = {
  supplyId: number;
  quantityPerProduct: number;
  unit: string | null;
  unitValue: number | null;
  stock: number;
};

async function fetchSuppliesInfo(supplyIds: number[]) {
  if (supplyIds.length === 0) return {} as Record<number, { unit: string | null; unitValue: number | null; stock: number }>;

  const { data, error } = await supabaseClient
    .from("insumos")
    .select("id, quantidade, unidade, valor")
    .in("id", supplyIds);

  if (error) {
    throw new Error(`Erro ao buscar dados de insumos: ${error.message}`);
  }

  return (
    data?.reduce<Record<number, { unit: string | null; unitValue: number | null; stock: number }>>((acc, row) => {
      acc[row.id as number] = {
        unit: (row as any).unidade ?? null,
        unitValue: (row as any).valor != null ? normalizeNumber((row as any).valor) : null,
        stock: (row as any).quantidade != null ? normalizeNumber((row as any).quantidade) : 0,
      };
      return acc;
    }, {}) ?? {}
  );
}

async function fetchProductCompositions(productIds: number[]) {
  if (productIds.length === 0) return {} as Record<number, Composition[]>;

  const { data, error } = await supabaseClient
    .from("produto_insumos")
    .select("produto_id, insumo_id, quantidade")
    .in("produto_id", productIds);

  if (error) {
    throw new Error(`Erro ao buscar composicao de produtos: ${error.message}`);
  }

  const supplyIds = Array.from(new Set((data ?? []).map((row) => row.insumo_id as number)));
  const supplyInfo = await fetchSuppliesInfo(supplyIds);

  const result: Record<number, Composition[]> = {};
  (data ?? []).forEach((row) => {
    const productId = row.produto_id as number;
    const supplyId = row.insumo_id as number;
    const info = supplyInfo[supplyId] ?? { unit: null, unitValue: null, stock: 0 };

    const composition: Composition = {
      supplyId,
      quantityPerProduct: normalizeNumber((row as any).quantidade),
      unit: info.unit,
      unitValue: info.unitValue,
      stock: info.stock,
    };

    if (!result[productId]) result[productId] = [];
    result[productId].push(composition);
  });

  return result;
}

async function registerSaleMovements(vendaId: number, saleDate: string, items: CreateVendaItemInput[]) {
  if (!items.length) return;

  const productIds = Array.from(new Set(items.map((i) => i.productId)));
  const compositionsByProduct = await fetchProductCompositions(productIds);

  const consumptionBySupply: Record<
    number,
    { quantity: number; unit: string | null; unitValue: number | null; stock: number }
  > = {};

  for (const item of items) {
    const compList = compositionsByProduct[item.productId] ?? [];
    if (!compList.length) continue;

    for (const comp of compList) {
      const consumed = item.quantity * comp.quantityPerProduct;
      if (consumed <= 0) continue;

      const current = consumptionBySupply[comp.supplyId] ?? {
        quantity: 0,
        unit: comp.unit,
        unitValue: comp.unitValue,
        stock: comp.stock,
      };

      current.quantity += consumed;
      if (current.unit === null) current.unit = comp.unit;
      if (current.unitValue === null) current.unitValue = comp.unitValue;
      consumptionBySupply[comp.supplyId] = current;
    }
  }

  const entries = Object.entries(consumptionBySupply);
  if (!entries.length) return;

  // Atualiza estoque dos insumos (baixa)
  await Promise.all(
    entries.map(async ([supplyId, entry]) => {
      const newQty = Math.max(0, (entry.stock ?? 0) - entry.quantity);
      const { error } = await supabaseClient.from("insumos").update({ quantidade: newQty }).eq("id", Number(supplyId));
      if (error) {
        throw new Error(`Erro ao baixar estoque do insumo ${supplyId}: ${error.message}`);
      }
    })
  );

  // Registra movimenta‡Æo de sa¡da por venda para cada insumo
  const movementDate = saleDate ?? new Date().toISOString();
  await Promise.all(
    entries.map(([supplyId, entry]) =>
      createMovimentacao({
        type: "saida_por_venda",
        supplyId: Number(supplyId),
        saleId: vendaId,
        quantity: entry.quantity,
        unit: entry.unit ?? undefined,
        unitValue: entry.unitValue ?? undefined,
        note: "Baixa automatica por venda",
        movementDate,
      })
    )
  );
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
  custo_unitario?: NumericLike | null;
  custo_total?: NumericLike | null;
  created_at?: string | null;
};

export type VendaItem = {
  id: number;
  saleId: number;
  productId: number;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  costUnit?: number | null;
  costTotal?: number | null;
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
    costUnit: row.custo_unitario != null ? normalizeNumber(row.custo_unitario) : null,
    costTotal: row.custo_total != null ? normalizeNumber(row.custo_total) : null,
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

async function fetchProductCosts(productIds: number[]) {
  const { data, error } = await supabaseClient
    .from("produtos")
    .select("id, custo")
    .in("id", productIds);
  if (error) {
    throw new Error(`Erro ao buscar custos de produtos: ${error.message}`);
  }
  return data?.reduce<Record<number, number>>((acc, item) => {
    acc[item.id as number] = normalizeNumber((item as any).custo);
    return acc;
  }, {}) ?? {};
}

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

  const productIds = Array.from(new Set(payload.items.map((i) => i.productId)));
  const productCosts = await fetchProductCosts(productIds);

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
    custo_unitario: productCosts[item.productId] ?? null,
    custo_total: productCosts[item.productId] != null ? productCosts[item.productId] * item.quantity : null,
  }));

  const { data: itensData, error: itensError } = await supabaseClient
    .from(ITENS_TABLE)
    .insert(itensPayload)
    .select("*");

  if (itensError || !itensData) {
    throw new Error(`Erro ao criar itens da venda: ${itensError?.message ?? "sem retorno"}`);
  }

  await registerSaleMovements(vendaId, saleDate, payload.items);

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


