import { headers } from "next/headers";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";

type TelegramUpdate = {
  update_id: number;
  message?: {
    message_id: number;
    date: number;
    text?: string;
    chat: { id: number; type: string };
    from?: { id: number; username?: string };
  };
};

function parsePillarAndBody(text: string):
  | { pillar: "AI_Apps" | "Sales_Entrepreneurship"; body: string }
  | null {
  const t = text.trim();
  const lower = t.toLowerCase();

  // Expected: "sales ..." or "ai ..." or "sales: ..." etc.
  const salesPrefix = ["sales:", "sales ", "sales-", "sales—"];
  const aiPrefix = ["ai:", "ai ", "ai-", "ai—", "ai_apps:", "ai apps:"];

  for (const p of salesPrefix) {
    if (lower.startsWith(p)) return { pillar: "Sales_Entrepreneurship", body: t.slice(p.length).trim() };
  }
  for (const p of aiPrefix) {
    if (lower.startsWith(p)) return { pillar: "AI_Apps", body: t.slice(p.length).trim() };
  }
  return null;
}

function wantsResearch(body: string) {
  return /\bresearch\b/i.test(body);
}

function wantsGenerate(body: string) {
  return /(\bgenerate\b|\bcreate\b|\bmake\b).*(pack|content|hooks|threads|reels|script)/i.test(body);
}

function isYes(text: string) {
  return /^(yes|y|ok|okay|do it|go)$/i.test(text.trim());
}

function isNo(text: string) {
  return /^(no|n|stop|cancel)$/i.test(text.trim());
}

async function tgSendMessage(chatId: number, text: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) throw new Error("Missing TELEGRAM_BOT_TOKEN");

  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text }),
  });
}

export async function POST(req: Request) {
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (secret) {
    const hdr = (await headers()).get("x-telegram-bot-api-secret-token");
    if (hdr !== secret) return new Response("Unauthorized", { status: 401 });
  }

  const allowed = process.env.TELEGRAM_ALLOWED_CHAT_ID;

  const update = (await req.json()) as TelegramUpdate;
  const msg = update.message;
  if (!msg || !msg.text) return new Response("ok", { status: 200 });

  if (allowed && String(msg.chat.id) !== String(allowed)) {
    return new Response("ok", { status: 200 });
  }

  const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

  const chatId = msg.chat.id;
  const messageId = String(msg.message_id);
  const text = msg.text;

  // Always store in inbox.
  const parsed = parsePillarAndBody(text);
  await convex.mutation(api.telegram.inboxAdd, {
    chatId: String(chatId),
    messageId,
    text,
    pillar: parsed?.pillar ?? null,
    createdAt: Date.now(),
  });

  // Confirmation flow: if user replies YES/NO, resolve last pending.
  if (isYes(text) || isNo(text)) {
    const res = await convex.action(api.telegram.pendingResolve, {
      chatId: String(chatId),
      response: isYes(text) ? "yes" : "no",
    });

    if (res.status === "none") {
      await tgSendMessage(chatId, "No pending action. Send a message starting with 'ai' or 'sales' and include 'research' or 'generate'.");
      return new Response("ok", { status: 200 });
    }

    if (res.status === "cancelled") {
      await tgSendMessage(chatId, `Cancelled (${res.kind}).`);
      return new Response("ok", { status: 200 });
    }

    await tgSendMessage(chatId, `✅ Started ${res.kind}. Concept saved. (ID: ${res.conceptId})`);
    return new Response("ok", { status: 200 });
  }

  // Only trigger if pillar is provided.
  if (!parsed) {
    await tgSendMessage(chatId, "Prefix your message with pillar. Example: 'sales: research cold email hooks' or 'ai: generate pack for voice agents for trades'.");
    return new Response("ok", { status: 200 });
  }

  const body = parsed.body;
  const kind = wantsResearch(body) ? "research" : wantsGenerate(body) ? "generate" : null;

  if (!kind) {
    // Just inbox it.
    await tgSendMessage(chatId, "Saved to idea inbox. If you want action: include the word 'research' or 'generate pack'.");
    return new Response("ok", { status: 200 });
  }

  // Create pending action for confirmation.
  const conceptTitle = body
    .replace(/\bresearch\b/gi, "")
    .replace(/\bgenerate\b/gi, "")
    .replace(/\bpack\b/gi, "")
    .trim();

  await convex.mutation(api.telegram.pendingCreate, {
    chatId: String(chatId),
    kind: kind === "generate" ? "generate" : "research",
    conceptTitle: conceptTitle || body,
    pillar: parsed.pillar,
    sourceMessageId: messageId,
  });

  await tgSendMessage(
    chatId,
    `I can ${kind === "generate" ? "generate the full pack" : "do research"} for: "${conceptTitle || body}"\nReply YES to proceed or NO to cancel.`
  );

  return new Response("ok", { status: 200 });
}
