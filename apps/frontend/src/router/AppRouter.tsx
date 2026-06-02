import React, { lazy, Suspense } from "react";
import { RouterProvider, createBrowserRouter, Outlet } from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";
import { MainLayout } from "../layouts/MainLayout";

const HomePage = lazy(() => import("../pages/HomePage").then((m) => ({ default: m.HomePage })));
const TabsPage = lazy(() => import("../pages/TabsPage").then((m) => ({ default: m.TabsPage })));
const LoginPage = lazy(() => import("../pages/LoginPage").then((m) => ({ default: m.LoginPage })));
const SignInPage = lazy(() => import("../pages/SignInPage").then((m) => ({ default: m.SignInPage })));

const RouteFallback = () => (
  <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "40vh" }}>
    <CircularProgress />
  </Box>
);

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
          {
            index: true,
            element: (
              <Suspense fallback={<RouteFallback />}>
                <HomePage />
              </Suspense>
            ),
          },
          {
            path: "tabs",
            element: (
              <Suspense fallback={<RouteFallback />}>
                <TabsPage />
              </Suspense>
            ),
          },
          {
            path: "login",
            element: (
              <Suspense fallback={<RouteFallback />}>
                <LoginPage />
              </Suspense>
            ),
          },
          {
            path: "signin",
            element: (
              <Suspense fallback={<RouteFallback />}>
                <SignInPage />
              </Suspense>
            ),
          },
        ],
      },
    ],
  },
]);

/** MainLayout stays eager for instant shell; heavy pages use React.lazy + Suspense. */
export const AppRouter = () => <RouterProvider router={router} />;
