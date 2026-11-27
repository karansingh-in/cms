import { sendNotification, setVapidDetails } from "web-push";
import { store } from "./store";

const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";
const privateKey = process.env.VAPID_PRIVATE_KEY ?? "";
const subject = process.env.VAPID_SUBJECT ?? "mailto:synesis@localhost";

export function pushConfigured(): boolean {
  return Boolean(publicKey && privateKey);
}

/** Push to every device the user allowed. Dead endpoints remove themselves. */
export async function sendPush(payload: { title: string; body: string; url?: string }): Promise<number> {
  if (!pushConfigured()) return 0;
  setVapidDetails(subject, publicKey, privateKey);

  const subs = await store.listPush();
  let sent = 0;

  await Promise.all(
    subs.map(async (sub) => {
      try {
        await sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          JSON.stringify(payload),
        );
        sent += 1;
      } catch (error) {
        const status = (error as { statusCode?: number }).statusCode;
        if (status === 404 || status === 410) await store.removePush(sub.endpoint);
      }
    }),
  );

  return sent;
}
