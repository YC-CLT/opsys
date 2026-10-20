import { execSync } from "child_process";

process.env.BUILD_STATIC = "1";
process.env.NEXT_PUBLIC_MODE = "static";

execSync("next build", { stdio: "inherit" });