import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const data = await request.json();

    // This will appear in your VSCode Terminal (where you ran npm run dev)
    console.log("\n--- 🚨 VSCODE TERMINAL ERROR LOG ---");
    console.log(`TIME:    ${new Date().toLocaleTimeString()}`);
    console.log(`STATUS:  ${data.status || "No Status"}`);
    console.log(`URL:     ${data.url || "Unknown URL"}`);
    console.log(`MSG:     ${data.message || "No Message"}`);
    console.log(`TOKEN:   ${data.tokenPresent ? "✅ ATTACHED" : "❌ MISSING"}`);
    console.log("-----------------------------------\n");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to log client error to terminal:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
