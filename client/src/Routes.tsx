import { useRoutes, Navigate } from "react-router-dom";

import { PythonWheels } from "./pages/python-wheels/python-wheels";
import { Search } from "./pages/search/search";
import { PackageDetail } from "./pages/search/package-detail";
import { Maven } from "./pages/maven/maven";
import { Npm } from "./pages/npm/npm";
import { Suspense } from "react";
import { Bullseye, Spinner } from "@patternfly/react-core";

export const Paths = {
  pythonWheels: "/python-wheels",
  search: "/search",
  packageDetail: "/search/:packageName/:version",
  maven: "/maven",
  npm: "/npm",
} as const;

export const AppRoutes = () => {
  const allRoutes = useRoutes([
    { path: "/", element: <Navigate to={Paths.search} /> },
    { path: Paths.pythonWheels, element: <PythonWheels /> },
    { path: Paths.search, element: <Search /> },
    { path: Paths.packageDetail, element: <PackageDetail /> },
    { path: Paths.maven, element: <Maven /> },
    { path: Paths.npm, element: <Npm /> },
  ]);

  return (
    <Suspense
      fallback={
        <Bullseye>
          <Spinner />
        </Bullseye>
      }
    >
      {allRoutes}
    </Suspense>
  );
};
