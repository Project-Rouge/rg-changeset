import { config } from "dotenv";
process.env.GITHUB_REF || config()

import { Env } from "./utils/Env";
import { prChecks } from "./utils/prChecks";
import { runCD } from "./utils/runCD";

if (Env.thisPrBranch) prChecks();
else runCD();