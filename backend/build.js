import fs from "fs";
import path from "path";

const distPath = path.resolve("dist");
const srcPath = path.resolve("src");

try {
  if (fs.existsSync(distPath)) {
    fs.rmSync(distPath, { recursive: true, force: true });
  }
  fs.cpSync(srcPath, distPath, { recursive: true });
  console.log("Build completed successfully: copied src to dist.");
} catch (error) {
  console.error("Build failed:", error);
  process.exit(1);
}
