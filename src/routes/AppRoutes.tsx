import { Route, Routes } from "react-router-dom";
import { AppLayout } from "../layouts/AppLayout/AppLayout";
import { Dashboard } from "../screens/Dashboard/Dashboard";
import { Orders } from "../screens/Orders/Orders";
import { SupplyRegistration } from "../screens/SupplyRegistration/SupplyRegistration";
import { Products } from "../screens/Products/Products";
import { Sales } from "../screens/Sales/Sales";
import { Movements } from "../screens/Movements/Movements";
import { SalesOverview } from "../screens/SalesOverview/SalesOverview";

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/insumos" element={<SupplyRegistration />} />
        <Route path="/produtos" element={<Products />} />
        <Route path="/vendas" element={<Sales />} />
        <Route path="/vendas-analitico" element={<SalesOverview />} />
        <Route path="/movimentacoes" element={<Movements />} />
        <Route path="/pedidos" element={<Orders />} />
      </Route>
    </Routes>
  );
}
