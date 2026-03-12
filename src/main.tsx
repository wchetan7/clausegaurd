import { createRoot } from "react-dom/client";
import { PostHogProvider } from "@posthog/react";
import App from "./App.tsx";
import "./index.css";

const posthogOptions = {
  api_host: import.meta.env.VITE_PUBLIC_POSTHOG_HOST,
};

createRoot(document.getElementById("root")!).render(
  <PostHogProvider
    apiKey={import.meta.env.VITE_PUBLIC_POSTHOG_KEY}
    options={posthogOptions}
  >
    <App />
  </PostHogProvider>
);
