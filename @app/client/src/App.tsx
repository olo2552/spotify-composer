import "./App.less";
import React, { Suspense } from "react";
import { Router, View, NotFoundBoundary, useLoadingRoute } from "react-navi";
import { ApolloProvider } from "@apollo/react-hooks";
import NProgress from "nprogress";

import client from "./helpers/apolloClient";
import { HelmetProvider } from "react-navi-helmet-async";
import routes from "./Routes";
import FourOhFour from "./404";

NProgress.configure({
  showSpinner: false,
});

function Loading() {
  let loadingRoute = useLoadingRoute();

  if (loadingRoute) {
    NProgress.start();
  } else {
    NProgress.done();
  }

  return null;
}

const App: React.FC = () => {
  return (
    <div className="App">
      <HelmetProvider>
        <ApolloProvider client={client}>
          <Router routes={routes}>
            <Loading />
            <NotFoundBoundary render={FourOhFour}>
              <Suspense fallback={null}>
                <View />
              </Suspense>
            </NotFoundBoundary>
          </Router>
        </ApolloProvider>
      </HelmetProvider>
    </div>
  );
};

export default App;
