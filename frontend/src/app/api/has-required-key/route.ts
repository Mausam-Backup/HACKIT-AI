import { NextResponse } from "next/server";
import { readUserConfigFile } from "@/lib/user-config-store";
import path from "path";

export const dynamic = "force-dynamic";

export async function GET() {
  const userConfigPath = process.env.USER_CONFIG_PATH || path.join(process.cwd(), "..", "backend", "app_data", "user-config.json");

  let keyFromFile = "";
  if (userConfigPath) {
    try {
      const cfg = readUserConfigFile<{ OPENAI_API_KEY?: string }>(userConfigPath);
      keyFromFile = cfg?.OPENAI_API_KEY || "";
    } catch {
      keyFromFile = "";
    }
  }
  const keyFromEnv = process.env.OPENAI_API_KEY || "";
  const hasKey = Boolean((keyFromFile || keyFromEnv).trim());

  return NextResponse.json({ hasKey });
}
