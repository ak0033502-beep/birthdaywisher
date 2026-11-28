import "@/lib/netFix";
import { INSTAGRAM_HANDLE, INSTAGRAM_URL, SITE_URL } from "@/lib/site";
import {
    GIVEAWAY_HASHTAG,
    GIVEAWAY_NAME,
    getGiveawayRegionPack,
    getPrizeInfo,
    type GiveawayPrizeId,
    type GiveawayRegion,
} from "@/lib/giveawayTypes";

const DEFAULT_FROM = "BirthdayWisher.fun <hello@birthdaywisher.fun>";
const REPLY_TO = "hello@birthdaywisher.fun";

function escHtml(s: string): string {
    return s
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

export interface SendEmailResult {
    ok: boolean;
    id?: string;
    status: number;
    error?: string;
}

export async function sendResendEmail(params: {
    to: string;
    subject: string;
    html: string;
    text: string;
    unsubUrl?: string;
}): Promise<SendEmailResult> {
    const apiKey = (process.env.RESEND_API_KEY || "").trim();
    if (!apiKey) {
        return { ok: false, status: 0, error: "RESEND_API_KEY is not configured in environment variables." };
    }
    const from = (process.env.GIVEAWAY_FROM_EMAIL || DEFAULT_FROM).trim();

    try {
        const res = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                from,
                to: [params.to],
                reply_to: REPLY_TO,
                subject: params.subject,
                html: params.html,
                text: params.text,
                ...(params.unsubUrl
                    ? {
                          headers: {
                              "List-Unsubscribe": `<${params.unsubUrl}>`,
                          },
                      }
                    : {}),
            }),
            signal: AbortSignal.timeout(9000),
        });

        const data = (await res.json().catch(() => ({}))) as {
            id?: string;
            message?: string;
            error?: { message?: string };
        };

        if (!res.ok) {
            return {
                ok: false,
                status: res.status,
                error: data.message || data.error?.message || `Resend HTTP ${res.status}`,
            };
        }
        return { ok: true, id: data.id, status: res.status };
    } catch (e) {
        return {
            ok: false,
            status: 504,
            error: String((e as Error)?.message || "Network timeout talking to Resend"),
        };
    }
}

export function buildEntryTicketEmail(input: {
    igHandle: string;
    ticketCode: string;
    reelUrl: string;
    prizeChoice: GiveawayPrizeId;
    region?: GiveawayRegion;
    isInPerson?: boolean;
    sentCollab?: boolean;
    sharedStory?: boolean;
    totalScore: number;
    unsubToken: string;
}): { subject: string; html: string; text: string; unsubUrl: string } {
    const reg = input.region || "IN";
    const pack = getGiveawayRegionPack(reg);
    const prize = getPrizeInfo(input.prizeChoice, reg);
    const unsubUrl = `${SITE_URL}/api/giveaway/unsubscribe?token=${encodeURIComponent(input.unsubToken)}`;
    const giveawayUrl = `${SITE_URL}/giveaway`;
    const subject = `🎟️ ReelFest Pass #${input.ticketCode} Confirmed — Win ${pack.amountDisplay} on BirthdayWisher.fun!`;
    const claimedSummary = [
        "🎬 15–30s Reel (+10)",
        input.isInPerson ? "🎥 In-Person (+15)" : "🙈 Faceless (+0)",
        input.sentCollab ? "🤝 Collab (+5)" : null,
        input.sharedStory ? "📲 Story (+5)" : null,
    ]
        .filter(Boolean)
        .join(" · ");

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escHtml(subject)}</title>
</head>
<body style="margin:0;padding:0;background-color:#FFF6EC;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#2B2240;-webkit-font-smoothing:antialiased;">
  <!-- Preheader -->
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;font-size:1px;line-height:1px;">
    ${GIVEAWAY_NAME} VIP Pass #${escHtml(input.ticketCode)} locked for ${escHtml(input.igHandle)}! Selected reward: ${escHtml(prize.title)}.
  </div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#FFF6EC;padding:28px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:580px;background-color:#FFFFFF;border-radius:28px;overflow:hidden;border:1px solid #F3DFD1;box-shadow:0 18px 46px rgba(43,34,64,0.09);">

          <!-- Top Festival Hero Header -->
          <tr>
            <td align="center" style="background:linear-gradient(135deg,#1E1338 0%,#35195B 55%,#4B1948 100%);background-color:#241646;padding:34px 28px 30px;text-align:center;">
              <div style="display:inline-block;padding:6px 14px;border-radius:999px;background-color:rgba(255,217,61,0.16);border:1px solid rgba(255,217,61,0.48);color:#FFD93D;font-size:11.5px;font-weight:800;letter-spacing:1px;text-transform:uppercase;">
                🎂 BIRTHDAYWISHER REELFEST · ${escHtml(pack.amountDisplay)} EDITION
              </div>
              <h1 style="margin:16px 0 8px;font-size:28px;line-height:1.18;font-weight:900;color:#FFFFFF;letter-spacing:-0.3px;">
                Welcome to ReelFest, ${escHtml(input.igHandle)}! 🎉
              </h1>
              <p style="margin:0;font-size:15px;line-height:1.55;color:#E9DFF8;max-width:440px;">
                Your Instagram Reel (${GIVEAWAY_HASHTAG}) is locked on our Open 100-Point Scoreboard. Here is your official ReelFest VIP Pass:
              </p>
            </td>
          </tr>

          <!-- Main Body -->
          <tr>
            <td style="padding:28px 26px 12px;">

              <!-- Perforated Golden VIP Ticket Card -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:linear-gradient(155deg,#231746 0%,#160F2E 100%);background-color:#1C1238;border-radius:22px;border:2px dashed #FFD93D;padding:22px 22px 20px;margin-bottom:22px;">
                <tr>
                  <td>
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="font-size:11px;font-weight:900;letter-spacing:1.2px;color:#FFD93D;text-transform:uppercase;">
                          🎟️ REELFEST VIP PASS · S1
                        </td>
                        <td align="right" style="font-size:11px;font-weight:900;letter-spacing:0.8px;color:#2ED8B6;text-transform:uppercase;">
                          ● REGISTERED
                        </td>
                      </tr>
                    </table>

                    <div style="margin:8px 0 2px;font-size:36px;line-height:1.05;font-weight:900;letter-spacing:1.2px;color:#FFFFFF;">
                      #${escHtml(input.ticketCode)}
                    </div>
                    <div style="font-size:15px;font-weight:800;color:#FF8FB8;margin-bottom:16px;">
                      ${escHtml(input.igHandle)}
                    </div>

                    <div style="border-top:1px dashed rgba(255,255,255,0.24);margin:14px 0;"></div>

                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size:13.5px;line-height:1.7;color:#FFFFFF;">
                      <tr>
                        <td style="color:#BDB2DC;font-weight:600;padding:3px 0;">Chosen ${escHtml(pack.amountDisplay)} Reward</td>
                        <td align="right" style="font-weight:800;color:#FFD93D;padding:3px 0;">${escHtml(prize.emoji)} ${escHtml(prize.shortTitle)}</td>
                      </tr>
                      <tr>
                        <td style="color:#BDB2DC;font-weight:600;padding:3px 0;">Claimed Action Bonus</td>
                        <td align="right" style="font-weight:800;color:#2ED8B6;padding:3px 0;">${escHtml(claimedSummary)}</td>
                      </tr>
                      <tr>
                        <td style="color:#BDB2DC;font-weight:600;padding:3px 0;">Creativity + Real Views</td>
                        <td align="right" style="font-weight:800;color:#FFFFFF;padding:3px 0;">Up to 65 pts (35 + 30)</td>
                      </tr>
                      <tr>
                        <td style="color:#BDB2DC;font-weight:600;padding:3px 0;">Winner Rule</td>
                        <td align="right" style="font-weight:800;color:#FFD93D;padding:3px 0;">Highest Score / 100 Wins 🏆</td>
                      </tr>
                      <tr>
                        <td style="color:#BDB2DC;font-weight:600;padding:3px 0;">Submitted Reel</td>
                        <td align="right" style="padding:3px 0;">
                          <a href="${escHtml(input.reelUrl)}" style="color:#FF8FB8;font-weight:800;text-decoration:underline;">Open Reel ↗</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Boost Your Winning Chance Box -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#FFF4EA;border-radius:20px;border:1px solid #FFE1CC;padding:18px 20px;margin-bottom:24px;">
                <tr>
                  <td>
                    <div style="font-size:14.5px;font-weight:900;color:#2B2240;margin-bottom:10px;">
                      ⚖️ How Your Reel Is Scored Out of 100 Points:
                    </div>
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size:13.5px;line-height:1.55;color:#4B4260;">
                      <tr>
                        <td valign="top" width="26" style="padding-bottom:8px;font-weight:900;color:#FF5C8A;">1.</td>
                        <td style="padding-bottom:8px;"><b>Action &amp; Format Points (35 pts):</b> <b>+10 pts</b> valid 15–30s Reel (${GIVEAWAY_HASHTAG}) · <b>+15 pts Direct Bonus</b> for In-Person / Face Reaction Reels · <b>+5 pts</b> Collab invite to <a href="${INSTAGRAM_URL}" style="color:#FF5C8A;font-weight:800;text-decoration:none;">${INSTAGRAM_HANDLE}</a> · <b>+5 pts</b> Story share + tag. <i>(Faceless screen-records skip the +15 bonus, so go extra creative!)</i></td>
                      </tr>
                      <tr>
                        <td valign="top" width="26" style="padding-bottom:8px;font-weight:900;color:#FF5C8A;">2.</td>
                        <td style="padding-bottom:8px;"><b>Creativity (0–35 pts) + Real Views (0–30 pts):</b> Judged on originality, humour/emotion, editing, and organic Reel reach. Highest total out of <b>100 pts</b> wins ${escHtml(pack.amountDisplay)} directly!</td>
                      </tr>
                      <tr>
                        <td valign="top" width="26" style="font-weight:900;color:#FF5C8A;">3.</td>
                        <td><b>Want 2× Shots at #1?</b> Screenshot Ticket <b>#${escHtml(input.ticketCode)}</b> on your Story for a daily repost boost, and submit up to <b>1 more distinct Reel</b> before the timer ends!</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Primary CTA Button -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:22px;">
                <tr>
                  <td align="center">
                    <a href="${giveawayUrl}" style="display:inline-block;background:linear-gradient(135deg,#FF5C8A 0%,#FF9F43 100%);background-color:#FF5C8A;color:#FFFFFF;text-decoration:none;font-weight:900;font-size:15.5px;padding:15px 32px;border-radius:999px;box-shadow:0 10px 24px rgba(255,92,138,0.32);">
                      🎟️ View Open 100-Point Scoreboard →
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 18px;text-align:center;font-size:13.5px;line-height:1.6;color:#6B6380;">
                Have a question? Just reply directly to this email — it goes straight to us at <b>hello@birthdaywisher.fun</b> ❤️
              </p>
            </td>
          </tr>

          <!-- Footer Band -->
          <tr>
            <td align="center" style="background-color:#FAF0E6;padding:18px 24px;border-top:1px solid #F0DFD0;font-size:12px;line-height:1.6;color:#7A728F;">
              <b>🎂 BirthdayWisher.fun</b> · Free 60-Second Interactive Birthday &amp; Anniversary Surprises<br/>
              <a href="${INSTAGRAM_URL}" style="color:#FF5C8A;font-weight:700;text-decoration:none;">Instagram (${INSTAGRAM_HANDLE})</a> &nbsp;·&nbsp;
              <a href="${SITE_URL}/create" style="color:#7C5CFF;font-weight:700;text-decoration:none;">Create a Wish</a> &nbsp;·&nbsp;
              <a href="${escHtml(unsubUrl)}" style="color:#7A728F;text-decoration:underline;">Unsubscribe</a>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    const text = [
        `Welcome to ${GIVEAWAY_NAME}, ${input.igHandle}!`,
        `Official VIP Ticket: #${input.ticketCode}`,
        `Chosen ${pack.amountDisplay} Reward: ${prize.title}`,
        `Claimed Action Bonus: ${claimedSummary} (verified on Instagram by our team)`,
        `Judge Review: Creativity (0-35 pts) + Real Views (0-30 pts) = /100 pts`,
        `Winner Rule: Highest Score / 100 Wins Directly`,
        `Submitted Reel: ${input.reelUrl}`,
        ``,
        `How Your Reel Is Scored Out of 100:`,
        `1. Action & Format (35 pts): +10 valid 15-30s Reel (${GIVEAWAY_HASHTAG}), +15 Direct In-Person Bonus (faceless = 0 here, needs high creativity), +5 Collab invite to ${INSTAGRAM_HANDLE}, +5 Story share tagging ${INSTAGRAM_HANDLE}.`,
        `2. Creativity (0-35 pts) + Real Views (0-30 pts): Highest total score out of 100 wins ${pack.amountDisplay}!`,
        `3. You may submit 1 more distinct creative Reel before the timer ends.`,
        ``,
        `Live Scoreboard: ${giveawayUrl}`,
        `Unsubscribe: ${unsubUrl}`,
    ].join("\n");

    return { subject, html, text, unsubUrl };
}

export async function sendGiveawayEntryConfirmation(input: {
    to: string;
    igHandle: string;
    ticketCode: string;
    reelUrl: string;
    prizeChoice: GiveawayPrizeId;
    region?: GiveawayRegion;
    isInPerson?: boolean;
    sentCollab?: boolean;
    sharedStory?: boolean;
    totalScore: number;
    unsubToken: string;
}): Promise<SendEmailResult> {
    const built = buildEntryTicketEmail(input);
    return sendResendEmail({
        to: input.to,
        subject: built.subject,
        html: built.html,
        text: built.text,
        unsubUrl: built.unsubUrl,
    });
}

export function buildBroadcastEmailHtml(input: {
    heading: string;
    bodyText: string;
    ctaLabel: string;
    ctaUrl: string;
    igHandle?: string;
    ticketCode?: string;
    prizeChoice?: GiveawayPrizeId;
    region?: GiveawayRegion;
    unsubToken?: string;
}): { html: string; text: string } {
    const unsubUrl = input.unsubToken
        ? `${SITE_URL}/api/giveaway/unsubscribe?token=${encodeURIComponent(input.unsubToken)}`
        : `${SITE_URL}/giveaway`;

    const prize = input.prizeChoice ? getPrizeInfo(input.prizeChoice, input.region || "IN") : null;
    const paragraphs = input.bodyText
        .split(/\n+/)
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => `<p style="margin:0 0 14px;font-size:15.5px;line-height:1.65;color:#393052;">${escHtml(line)}</p>`)
        .join("");

    const ticketPill = input.ticketCode
        ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#FFF4EA;border:1.5px dashed #FFB088;border-radius:16px;padding:12px 16px;margin-bottom:18px;">
             <tr>
               <td style="font-size:13px;color:#2B2240;font-weight:700;">
                 🎟️ Your Ticket: <b style="color:#FF5C8A;">#${escHtml(input.ticketCode)}</b>${input.igHandle ? ` (${escHtml(input.igHandle)})` : ""}
               </td>
               ${prize ? `<td align="right" style="font-size:12.5px;font-weight:800;color:#7C5CFF;">${escHtml(prize.emoji)} ${escHtml(prize.shortTitle)}</td>` : ""}
             </tr>
           </table>`
        : "";

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escHtml(input.heading)}</title>
</head>
<body style="margin:0;padding:0;background-color:#FFF6EC;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#2B2240;-webkit-font-smoothing:antialiased;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#FFF6EC;padding:28px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:580px;background-color:#FFFFFF;border-radius:28px;overflow:hidden;border:1px solid #F3DFD1;box-shadow:0 18px 46px rgba(43,34,64,0.09);">

          <!-- Top Party Header -->
          <tr>
            <td align="center" style="background:linear-gradient(135deg,#221542 0%,#3F1D6B 55%,#FF5C8A 140%);background-color:#2A1850;padding:32px 26px 28px;text-align:center;">
              <div style="display:inline-block;padding:5px 13px;border-radius:999px;background-color:rgba(255,255,255,0.12);border:1px solid rgba(255,255,255,0.28);color:#FFD93D;font-size:11.5px;font-weight:800;letter-spacing:0.9px;text-transform:uppercase;">
                🎁 BIRTHDAYWISHER REELFEST UPDATE
              </div>
              <h1 style="margin:14px 0 0;font-size:26px;line-height:1.22;font-weight:900;color:#FFFFFF;">
                ${escHtml(input.heading)}
              </h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding:28px 26px 16px;">
              ${ticketPill}
              <p style="margin:0 0 14px;font-size:16px;font-weight:800;color:#2B2240;">
                Hey ${input.igHandle ? escHtml(input.igHandle) : "Creator"} 👋
              </p>
              ${paragraphs}

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:24px 0 20px;">
                <tr>
                  <td align="center">
                    <a href="${escHtml(input.ctaUrl)}" style="display:inline-block;background:linear-gradient(135deg,#FF5C8A 0%,#7C5CFF 100%);background-color:#FF5C8A;color:#FFFFFF;text-decoration:none;font-weight:900;font-size:15.5px;padding:15px 32px;border-radius:999px;box-shadow:0 10px 24px rgba(124,92,255,0.28);">
                      ${escHtml(input.ctaLabel)}
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 10px;text-align:center;font-size:13px;color:#6B6380;">
                With love from <b>Team BirthdayWisher.fun</b> · Reply anytime to <b>hello@birthdaywisher.fun</b> ❤️
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="background-color:#FAF0E6;padding:18px 24px;border-top:1px solid #F0DFD0;font-size:12px;line-height:1.6;color:#7A728F;">
              <b>🎂 BirthdayWisher.fun</b> · <a href="${INSTAGRAM_URL}" style="color:#FF5C8A;font-weight:700;text-decoration:none;">${INSTAGRAM_HANDLE}</a> &nbsp;·&nbsp;
              <a href="${SITE_URL}/giveaway" style="color:#7C5CFF;font-weight:700;text-decoration:none;">${GIVEAWAY_NAME}</a> &nbsp;·&nbsp;
              <a href="${escHtml(unsubUrl)}" style="color:#7A728F;text-decoration:underline;">Unsubscribe</a>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    const text = [
        input.heading,
        "",
        `Hey ${input.igHandle || "Creator"},`,
        input.ticketCode ? `Your Ticket: #${input.ticketCode}` : "",
        "",
        input.bodyText,
        "",
        `${input.ctaLabel}: ${input.ctaUrl}`,
        "",
        `Unsubscribe: ${unsubUrl}`,
    ]
        .filter((x) => x !== undefined)
        .join("\n");

    return { html, text };
}
