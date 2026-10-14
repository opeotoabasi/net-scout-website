
const SUPABASE_URL = "https://wtyzhfuetyayhhwgbxmo.supabase.co/functions/v1/waitlist-signup";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_-QwE32FWEqVn6dhVqGglqw_Aqr1KP5i";
const GOOGLE_FORM_URL = "https://forms.gle/DSrrwfXE6E519eYu5";

const form = document.getElementById("waitlist-form");
const statusMessage = document.getElementById("form-status");
const submitButton = form.querySelector('button[type="submit"]');

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!form.reportValidity()) return;

  const email = document.getElementById("email").value.trim();
  const whatsapp = document.getElementById("whatsapp").value.trim();
  const consent = document.getElementById("consent").checked;

  submitButton.disabled = true;
  statusMessage.textContent = "Saving your signup…";

  try {
    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/waitlist-signup`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify({ email, whatsapp, consent }),
      }
    );

    const result = await response.json();

    if (!response.ok || result.success !== true) {
      throw new Error(
        result.error || "We couldn't save your signup. Please try again."
      );
    }

    // Redirect only after the backend confirms a successful save.
    window.location.assign(GOOGLE_FORM_URL);
  } catch (error) {
    console.error("Waitlist signup failed:", error);
    statusMessage.textContent =
      error.message || "Connection problem. Please try again.";
    submitButton.disabled = false;
  }
});

document.getElementById("year").textContent = new Date().getFullYear();
