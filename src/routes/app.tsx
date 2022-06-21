import { Link, Outlet } from "@tanstack/react-location";

function AppRoute() {
  return (
    <div>
      app
      <Link to="test-db">open test database</Link>
      <Outlet />
    </div>
  );
}

export default AppRoute;
