// Create a BroadcastChannel for real-time communication with the card view
const cardChannel = new BroadcastChannel("credit_card_channel");

window.onload = function () {
  // Make form visible (remove preload/loading state)
  setTimeout(function () {
    document.body.classList.add("loaded");
  }, 100);

  const name = document.getElementById("name");
  const email = document.getElementById("email");
  const phone = document.getElementById("phone");
  // securitycode removed (now constant)
  const openCardBtn = document.getElementById("openCardBtn");
  const statusIndicator = document.getElementById("statusIndicator");

  // Keep card number constant
  const CARD_NUMBER = "7007********5055";
  // Keep expiration constant (12 / infinity sign)
  const EXPIRATION = "12-∞";
  // Keep security code constant
  const SECURITY_CODE = "985";

  let cardWindow = null;

  // Security code mask removed (now constant)

  // SVG Icons (simplified - only showing a few for brevity)
  let amex = `<g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"> <g id="amex" fill-rule="nonzero"> <rect id="Rectangle-1" fill="#2557D6" x="0" y="0" width="750" height="471" rx="40"></rect> </g> </g>`;
  let visa = `<g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"> <g id="visa" fill-rule="nonzero"> <rect id="Rectangle-1" fill="#0E4595" x="0" y="0" width="750" height="471" rx="40"></rect> </g> </g>`;
  let mastercard = `<g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"> <g id="mastercard" fill-rule="nonzero"> <rect id="Rectangle-1" fill="#000000" x="0" y="0" width="750" height="471" rx="40"></rect> </g> </g>`;
  let discover = `<g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"> <g id="discover" fill-rule="nonzero"> <path d="M52.8771038,0 C23.6793894,0 -4.55476115e-15,23.1545612 0,51.7102589 L0,419.289737 C0,447.850829 23.671801,471 52.8771038,471 L697.122894,471 C726.320615,471 750,447.845433 750,419.289737 L750,252.475404 L750,51.7102589 C750,23.1491677 726.328202,-4.4533018e-15 697.122894,0 L52.8771038,0 Z" id="Shape" fill="#4D4D4D"></path> </g> </g>`;

  // Broadcast name changes
  name.addEventListener("input", function () {
    const nameValue = name.value.length == 0 ? "JOHN DOE" : this.value;
    cardChannel.postMessage({
      type: "name",
      value: nameValue,
    });
  });

  const cardStyleSelect = document.getElementById("cardStyle");

  // Send selected card style whenever it changes
  cardStyleSelect.addEventListener("change", () => {
    cardChannel.postMessage({
      type: "card_style",
      value: cardStyleSelect.value,
    });
  });

  document.getElementById("openCardBtn").addEventListener("click", () => {
    cardChannel.postMessage({
      type: "card_style",
      value: cardStyleSelect.value,
    });
  });

  // Security code broadcasting removed; security code is constant

  // Open card view in new window
  openCardBtn.addEventListener("click", function () {
    if (!cardWindow || cardWindow.closed) {
      cardWindow = window.open(
        "index.html",
        "CreditCardView",
        "width=800,height=600"
      );
      statusIndicator.textContent = "Card view opened!";
      statusIndicator.className = "status-indicator connected";
    } else {
      cardWindow.focus();
    }
  });

  // Listen for messages from card view (to know if it's open)
  cardChannel.addEventListener("message", function (event) {
    if (event.data.type === "card_ready") {
      statusIndicator.textContent = "Card view connected!";
      statusIndicator.className = "status-indicator connected";

      // Send current values to the newly opened card
      cardChannel.postMessage({
        type: "name",
        value: name.value.length == 0 ? "JOHN DOE" : name.value,
      });
      cardChannel.postMessage({
        type: "cardnumber",
        value: CARD_NUMBER,
        cardtype: "Unknown",
      });
      cardChannel.postMessage({
        type: "expiration",
        value: EXPIRATION,
      });
      cardChannel.postMessage({
        type: "security",
        value: SECURITY_CODE,
      });
    }
  });

  // Check periodically if card window is closed
  setInterval(function () {
    if (cardWindow && cardWindow.closed) {
      statusIndicator.textContent = "Card view not open";
      statusIndicator.className = "status-indicator disconnected";
      cardWindow = null;
    }
  }, 1000);

  // Save to Excel functionality
  const saveExcelBtn = document.getElementById("saveExcelBtn");

  saveExcelBtn.addEventListener("click", async function () {
    // Get current form data
    const formData = {
      Name: name.value || "JOHN DOE",
      Email: email.value || "",
      Phone: phone.value || "",
      CardNumber: CARD_NUMBER,
      ExpirationDate: EXPIRATION,
      SecurityCode: SECURITY_CODE,
    };

    // Check if email is provided
    if (!email.value) {
      alert("Please enter an email address before saving.");
      email.focus();
      return;
    }

    // Disable button while saving
    saveExcelBtn.disabled = true;
    saveExcelBtn.textContent = "Saving...";

    try {
      // Send data to server
      const response = await fetch("http://localhost:3000/api/save-card-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        alert(`Data saved successfully! Total entries: ${result.totalEntries}`);

        // Clear form after successful save (security code omitted)
        name.value = "";
        email.value = "";
        phone.value = "";

        // Reset masks (security code mask removed)
      } else {
        alert("Error: " + result.message);
      }
    } catch (error) {
      console.error("Error saving data:", error);
      alert(
        "Failed to save data. Make sure the server is running.\n\nTo start the server, run: npm install && npm start"
      );
    } finally {
      // Re-enable button
      saveExcelBtn.disabled = false;
      saveExcelBtn.textContent = "Save to Excel";
    }
  });
};
