import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

function githubPagesRouteFallback(base: string) {
  const productionBase = base.endsWith("/uat/") ? base.slice(0, -4) : base;
  const uatBase = base.endsWith("/uat/") ? base : `${base}uat/`;
  const fallbackHtml = `<!doctype html>
<html lang="en">
  <head><meta charset="utf-8"><title>Careerfolio</title></head>
  <body>
    <script>
      const pathname = window.location.pathname;
      const base = pathname.startsWith(${JSON.stringify(uatBase)}) ? ${JSON.stringify(uatBase)} : ${JSON.stringify(productionBase)};
      const route = "/" + pathname.slice(base.length) + window.location.search + window.location.hash;
      window.location.replace(base + "?__route=" + encodeURIComponent(route));
    </script>
  </body>
</html>`;

  return {
    name: "github-pages-route-fallback",
    generateBundle() {
      this.emitFile({ type: "asset", fileName: "404.html", source: fallbackHtml });
    },
  };
}

const base = process.env.VITE_BASE_PATH || "/";

export default defineConfig({
  base,
  plugins: [react(), githubPagesRouteFallback(base)],
  server: {
    host: "localhost",
    port: 8080,
    strictPort: true,
  },
});
