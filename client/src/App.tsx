import type React from "react";
import { BrowserRouter as Router, useLocation } from "react-router-dom";
import { useEffect } from "react";

import { DefaultLayout } from "./layout";
import "@patternfly/patternfly/patternfly.css";
import "@patternfly/patternfly/patternfly-addons.css";
import { AppRoutes } from "./Routes";

const rawBase = import.meta.env.BASE_URL ?? "/";

// React Router expects an absolute pathname; remove trailing slash except for "/"
const basename =
  rawBase === "/"
    ? "/"
    : (rawBase.startsWith("/") ? rawBase : `/${rawBase}`).replace(/\/$/, "");

// Component to handle scroll to top on route changes
const ScrollToTop: React.FC = () => {
  const location = useLocation();
  
  useEffect(() => {
    // Immediate scroll
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    
    // Force scroll on PatternFly containers
    const mainContent = document.querySelector('main');
    if (mainContent) mainContent.scrollTop = 0;
    
    const pageMain = document.querySelector('.pf-v6-c-page__main');
    if (pageMain) pageMain.scrollTop = 0;
  }, [location.pathname, location.search]);
  
  return null;
};

const App: React.FC = () => {
  return (
    <Router basename={basename}>
      <ScrollToTop />
      <DefaultLayout>
        <AppRoutes />
      </DefaultLayout>
    </Router>
  );
};

export default App;
