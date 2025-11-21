import * as S from "./style";

export function Dashboard() {
  return (
    <main style={S.container}>
      <section style={S.card}>
        <h1 style={S.heading}>Bem-vinda à Marcelina</h1>
        <p style={S.paragraph}>
          Aqui você vai acompanhar os indicadores gerais da confeitaria. Conforme formos liberando mais módulos, este
          painel mostrará status de pedidos, produção e estoque.
        </p>
      </section>
    </main>
  );
}
