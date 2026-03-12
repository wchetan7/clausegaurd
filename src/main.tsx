import { createRoot } from "react-dom/client";
import { PostHogProvider } from "@posthog/react";
import App from "./App.tsx";
import "./index.css";

const POSTHOG_KEY = import.meta.env.VITE_PUBLIC_POSTHOG_KEY || "phc_GM4PU2tv4S0ljC3EzbikobN8wDnZDZWwPyAuZbj07Um";
const POSTHOG_HOST = import.meta.env.VITE_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";

const posthogOptions = {
  api_host: POSTHOG_HOST,
};

createRoot(document.getElementById("root")!).render(
  <PostHogProvider
    apiKey={import.meta.env.VITE_PUBLIC_POSTHOG_KEY}
    options={posthogOptions}
  >
    <App />
  </PostHogProvider>
);
