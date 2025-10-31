import React from "react";
import { RouterProvider, createBrowserRouter, useNavigation, Outlet } from "react-router-dom";
import { MainLayout } from "../layouts/MainLayout";
import { HomePage } from "../pages/HomePage";
import { TabsPage } from "../pages/TabsPage";
import { HowItWorksPage } from "../pages/HowItWorksPage";
import { IconLoader } from "../components/IconLoader/IconLoader";

const GlobalLoaderWrapper: React.FC = () => {
  const navigation = useNavigation();
  const [initialLoading, setInitialLoading] = React.useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => setInitialLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const isLoading = navigation.state === "loading" || initialLoading;

  return (
    <>
      <Outlet />
      <IconLoader active={isLoading} />
    </>
  );
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <GlobalLoaderWrapper />,
    children: [
      {
        element: <MainLayout />,
        children: [
          { index: true, element: <HomePage /> },
          { path: "tabs", element: <TabsPage /> },
          //{ path: "how-it-works", element: <HowItWorksPage /> },
        ],
      },
    ],
  },
]);

export const AppRouter = () => <RouterProvider router={router} />;