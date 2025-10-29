import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { MainLayout } from "../layouts/MainLayout";
import { HomePage } from "../pages/HomePage";
import { TabsPage } from "../pages/TabsPage";
import { HowItWorksPage } from "../pages/HowItWorksPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "tabs", element: <TabsPage /> },
      { path: "how-it-works", element: <HowItWorksPage /> },
    ],
  },
]);

export const AppRouter = () => <RouterProvider router={router} />;