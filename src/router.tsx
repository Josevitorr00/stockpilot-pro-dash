import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

const RELOAD_KEY = "stockpilot:chunk-reload";

function isStaleChunkError(reason: unknown) {
  const message =
    typeof reason === "string"
      ? reason
      : reason instanceof Error
        ? reason.message
        : "";
  return (
    message.includes("Failed to fetch dynamically imported module") ||
    message.includes("error loading dynamically imported module") ||
    message.includes("Importing a module script failed")
  );
}

function reloadOnStaleChunk(reason: unknown) {
  if (!isStaleChunkError(reason)) return;
  if (sessionStorage.getItem(RELOAD_KEY)) return;
  sessionStorage.setItem(RELOAD_KEY, "1");
  window.location.reload();
}

if (typeof window !== "undefined") {
  sessionStorage.removeItem(RELOAD_KEY);
  window.addEventListener("unhandledrejection", (event) =>
    reloadOnStaleChunk(event.reason),
  );
  window.addEventListener("error", (event) => reloadOnStaleChunk(event.error));
}

export const getRouter = () => {
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
  });

  return router;
};

