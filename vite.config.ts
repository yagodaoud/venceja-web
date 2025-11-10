import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // load env variables for the current mode (development, production, etc.)
  const env = loadEnv(mode, process.cwd());

  return {
    server: {
      host: "::",
      port: 8082,
    },
    plugins: [react(), mode === "development" && componentTagger()].filter(
      Boolean
    ),
    // expose the VITE_API_URL to client code via a simple define replacement
    // client code can use `process.env.VITE_API_URL` or continue using `import.meta.env.VITE_API_URL`
    define: {
      "process.env.VITE_API_URL": JSON.stringify(env.VITE_API_URL),
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
