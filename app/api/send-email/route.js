import { Resend } from "resend";

export async function POST(req) {
  console.log("➡️ EMAIL API CALLED");

  try {
    const { to, subject, html } = await req.json();

    console.log("➡️ PAYLOAD RECEIVED:");
    console.log("to:", to);
    console.log("subject:", subject);
    console.log("html:", html);

    if (!to || !subject || !html) {
      console.log("❌ Missing required fields");
      return Response.json({ success: false, error: "Missing fields" });
    }

    console.log("➡️ USING API KEY:", process.env.RESEND_API_KEY);

    const resend = new Resend(process.env.RESEND_API_KEY);

    const data = await resend.emails.send({
      from: "LegitiMate <onboarding@resend.dev>",
      to,
      subject,
      html,
    });

    console.log("✔️ RESEND RESPONSE:", data);

    return Response.json({ success: true, data });
  } catch (error) {
    console.error("❌ ERROR SENDING EMAIL:", error);
    return Response.json({ success: false, error });
  }
}
