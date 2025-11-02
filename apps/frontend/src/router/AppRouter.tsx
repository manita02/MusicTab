import React from "react";
import { RouterProvider, createBrowserRouter, Outlet } from "react-router-dom";
import { MainLayout } from "../layouts/MainLayout";
import { HomePage } from "../pages/HomePage";
import { TabsPage } from "../pages/TabsPage";
import { HowItWorksPage } from "../pages/HowItWorksPage";
import { LoginPage } from "../pages/LoginPage";
import { SignInPage } from "../pages/SignInPage";

const GlobalWrapper: React.FC = () => {
  return <Outlet />;
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <GlobalWrapper />,
    children: [
      {
        element: <MainLayout />,
        children: [
          { index: true, element: <HomePage /> },
          { path: "tabs", element: <TabsPage /> },
          // { path: "how-it-works", element: <HowItWorksPage /> },
          { path: "/login", element: <LoginPage /> },
          { path: "/signin", element: <SignInPage /> },
        ],
      },
    ],
  },
]);

export const AppRouter = () => <RouterProvider router={router} />;