import { Outlet } from "react-router-dom";
import { Navigation } from "../../components/Navigation/Navigation";
import * as S from "./style";

export function AppLayout() {
  return (
    <div style={S.wrapper}>
      <Navigation />
      <div style={S.content}>
        <Outlet />
      </div>
    </div>
  );
}
