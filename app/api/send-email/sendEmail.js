export async function sendEmail(to, subject, html) {
    await fetch("/api/send-email", {
      method: "POST",
      body: JSON.stringify({ to, subject, html }),
    });
  }
  