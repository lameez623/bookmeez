// Server-only Discord webhook notifications.
// The webhook URL is read exclusively from process.env and never reaches the client.

type DiscordField = { name: string; value: string; inline?: boolean };

type DiscordEmbed = {
  title: string;
  color?: number;
  fields: DiscordField[];
  timestamp?: string;
};

const MAX_ATTEMPTS = 3;
const RETRY_DELAY_MS = 600;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function field(name: string, value: string | null | undefined, inline = true): DiscordField | null {
  const v = (value ?? "").toString().trim();
  if (!v) return null;
  return { name, value: v.slice(0, 1024), inline };
}

async function postToDiscord(embed: DiscordEmbed): Promise<boolean> {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) {
    console.error("[discord] DISCORD_WEBHOOK_URL is not configured — notification skipped");
    return false;
  }

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const res = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ embeds: [embed] }),
      });

      if (res.ok) return true;

      const body = await res.text().catch(() => "");
      console.error(
        `[discord] webhook attempt ${attempt}/${MAX_ATTEMPTS} failed with status ${res.status}: ${body.slice(0, 300)}`,
      );
    } catch (error) {
      console.error(`[discord] webhook attempt ${attempt}/${MAX_ATTEMPTS} threw`, error);
    }

    if (attempt < MAX_ATTEMPTS) await sleep(RETRY_DELAY_MS * attempt);
  }

  console.error("[discord] all webhook attempts failed — notification not delivered");
  return false;
}

export async function sendDiscordNotification(
  title: string,
  fields: (DiscordField | null)[],
  color = 0x8fa38c,
): Promise<boolean> {
  const timestamp = new Date().toISOString();
  const embed: DiscordEmbed = {
    title,
    color,
    fields: [
      ...(fields.filter(Boolean) as DiscordField[]),
      { name: "Notified at", value: timestamp, inline: false },
    ],
    timestamp,
  };
  return postToDiscord(embed);
}
