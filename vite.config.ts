import { execFileSync } from "node:child_process";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Branch e últimos commits, para o widget do git, a janela Git e o "git log" do terminal.
// Sem a pasta .git (alguns deploys), usa o que a Cloudflare Pages (ou a Vercel) informa.
function git(args: string[]) {
  try {
    return execFileSync("git", args, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
  } catch {
    return "";
  }
}

function infoGit() {
  const log = git(["log", "-n", "20", "--date=iso-strict", "--format=%h%x09%an%x09%ad%x09%s"]);
  if (log) {
    return {
      branch: git(["rev-parse", "--abbrev-ref", "HEAD"]) || "main",
      commits: log.split("\n").map((l) => {
        const [hash, autor, data, ...msg] = l.split("\t");
        return { hash, autor, data, msg: msg.join("\t") };
      }),
    };
  }
  const sha = process.env.CF_PAGES_COMMIT_SHA || process.env.VERCEL_GIT_COMMIT_SHA;
  return {
    branch: process.env.CF_PAGES_BRANCH || process.env.VERCEL_GIT_COMMIT_REF || "main",
    commits: sha
      ? [
          {
            hash: sha.slice(0, 7),
            autor: process.env.VERCEL_GIT_COMMIT_AUTHOR_NAME ?? "Eduardo",
            data: new Date().toISOString(),
            msg: (process.env.VERCEL_GIT_COMMIT_MESSAGE ?? "").split("\n")[0],
          },
        ]
      : [],
  };
}

export default defineConfig({
  plugins: [react()],
  define: { __GIT__: JSON.stringify(infoGit()) },
  // A intro (Three.js + GSAP) é um pedaço grande, mas já carrega separado, só na mesa 3D
  build: { chunkSizeWarningLimit: 1000 },
});
