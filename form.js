// Create a BroadcastChannel for real-time communication with the card view
const cardChannel = new BroadcastChannel('credit_card_channel');

window.onload = function () {
  // Make form visible (remove preload/loading state)
  setTimeout(function() {
    document.body.classList.add('loaded');
  }, 100);

  const name = document.getElementById('name');
  const email = document.getElementById('email');
  const cardnumber = document.getElementById('cardnumber');
  const expirationdate = document.getElementById('expirationdate');
  const securitycode = document.getElementById('securitycode');
  const ccicon = document.getElementById('ccicon');
  const generatecard = document.getElementById('generatecard');
  const openCardBtn = document.getElementById('openCardBtn');
  const statusIndicator = document.getElementById('statusIndicator');

  let cardWindow = null;

  // Mask the Credit Card Number Input
  var cardnumber_mask = new IMask(cardnumber, {
    mask: [
      {
        mask: '0000 000000 00000',
        regex: '^3[47]\\d{0,13}',
        cardtype: 'american express'
      },
      {
        mask: '0000 0000 0000 0000',
        regex: '^(?:6011|65\\d{0,2}|64[4-9]\\d?)\\d{0,12}',
        cardtype: 'discover'
      },
      {
        mask: '0000 000000 0000',
        regex: '^3(?:0([0-5]|9)|[689]\\d?)\\d{0,11}',
        cardtype: 'diners'
      },
      {
        mask: '0000 0000 0000 0000',
        regex: '^(5[1-5]\\d{0,2}|22[2-9]\\d{0,1}|2[3-7]\\d{0,2})\\d{0,12}',
        cardtype: 'mastercard'
      },
      {
        mask: '0000 000000 00000',
        regex: '^(?:2131|1800)\\d{0,11}',
        cardtype: 'jcb15'
      },
      {
        mask: '0000 0000 0000 0000',
        regex: '^(?:35\\d{0,2})\\d{0,12}',
        cardtype: 'jcb'
      },
      {
        mask: '0000 0000 0000 0000',
        regex: '^(?:5[0678]\\d{0,2}|6304|67\\d{0,2})\\d{0,12}',
        cardtype: 'maestro'
      },
      {
        mask: '0000 0000 0000 0000',
        regex: '^4\\d{0,15}',
        cardtype: 'visa'
      },
      {
        mask: '0000 0000 0000 0000',
        regex: '^62\\d{0,14}',
        cardtype: 'unionpay'
      },
      {
        mask: '0000 0000 0000 0000',
        cardtype: 'Unknown'
      }
    ],
    dispatch: function (appended, dynamicMasked) {
      var number = (dynamicMasked.value + appended).replace(/\D/g, '');

      for (var i = 0; i < dynamicMasked.compiledMasks.length; i++) {
        let re = new RegExp(dynamicMasked.compiledMasks[i].regex);
        if (number.match(re) != null) {
          return dynamicMasked.compiledMasks[i];
        }
      }
    }
  });

  // Mask the Expiration Date
  var expirationdate_mask = new IMask(expirationdate, {
    mask: 'MM/YY',
    blocks: {
      MM: {
        mask: IMask.MaskedRange,
        from: 1,
        to: 12
      },
      YY: {
        mask: IMask.MaskedRange,
        from: 0,
        to: 99
      }
    }
  });

  // Mask the security code
  var securitycode_mask = new IMask(securitycode, {
    mask: '0000',
  });

  // SVG Icons (simplified - only showing a few for brevity)
  let amex = `<g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"> <g id="amex" fill-rule="nonzero"> <rect id="Rectangle-1" fill="#2557D6" x="0" y="0" width="750" height="471" rx="40"></rect> </g> </g>`;
  let visa = `<g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"> <g id="visa" fill-rule="nonzero"> <rect id="Rectangle-1" fill="#0E4595" x="0" y="0" width="750" height="471" rx="40"></rect> </g> </g>`;
  let mastercard = `<g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"> <g id="mastercard" fill-rule="nonzero"> <rect id="Rectangle-1" fill="#000000" x="0" y="0" width="750" height="471" rx="40"></rect> </g> </g>`;
  let discover = `<g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"> <g id="discover" fill-rule="nonzero"> <path d="M52.8771038,0 C23.6793894,0 -4.55476115e-15,23.1545612 0,51.7102589 L0,419.289737 C0,447.850829 23.671801,471 52.8771038,471 L697.122894,471 C726.320615,471 750,447.845433 750,419.289737 L750,252.475404 L750,51.7102589 C750,23.1491677 726.328202,-4.4533018e-15 697.122894,0 L52.8771038,0 Z" id="Shape" fill="#4D4D4D"></path> </g> </g>`;

  // Broadcast card type changes
  cardnumber_mask.on("accept", function () {
    const cardtype = cardnumber_mask.masked.currentMask.cardtype;
    const cardValue = cardnumber_mask.value.length == 0 ? '0123 4567 8910 1112' : cardnumber_mask.value;
    
    // Update local icon
    switch (cardtype) {
      case 'american express':
        ccicon.innerHTML = amex;
        break;
      case 'visa':
        ccicon.innerHTML = visa;
        break;
      case 'mastercard':
        ccicon.innerHTML = mastercard;
        break;
      case 'discover':
        ccicon.innerHTML = discover;
        break;
      default:
        ccicon.innerHTML = '';
        break;
    }

    // Broadcast to card view
    cardChannel.postMessage({
      type: 'cardnumber',
      value: cardValue,
      cardtype: cardtype
    });
  });

  // Broadcast name changes
  name.addEventListener('input', function () {
    const nameValue = name.value.length == 0 ? 'JOHN DOE' : this.value;
    cardChannel.postMessage({
      type: 'name',
      value: nameValue
    });
  });

  // Broadcast expiration date changes
  expirationdate_mask.on('accept', function () {
    const expireValue = expirationdate_mask.value.length == 0 ? '01/23' : expirationdate_mask.value;
    cardChannel.postMessage({
      type: 'expiration',
      value: expireValue
    });
  });

  // Broadcast security code changes
  securitycode_mask.on('accept', function () {
    const securityValue = securitycode_mask.value.length == 0 ? '985' : securitycode_mask.value;
    cardChannel.postMessage({
      type: 'security',
      value: securityValue
    });
  });

  // Generate random card number
  const randomCard = function () {
    let testCards = [
      '4000056655665556',
      '5200828282828210',
      '371449635398431',
      '6011000990139424',
      '30569309025904',
      '3566002020360505',
      '6200000000000005',
      '6759649826438453',
    ];
    let randomNumber = Math.floor(Math.random() * testCards.length);
    cardnumber_mask.unmaskedValue = testCards[randomNumber];
  };

  generatecard.addEventListener('click', function () {
    randomCard();
  });

  // Open card view in new window
  openCardBtn.addEventListener('click', function () {
    if (!cardWindow || cardWindow.closed) {
      cardWindow = window.open('index.html', 'CreditCardView', 'width=800,height=600');
      statusIndicator.textContent = 'Card view opened!';
      statusIndicator.className = 'status-indicator connected';
    } else {
      cardWindow.focus();
    }
  });

  // Listen for messages from card view (to know if it's open)
  cardChannel.addEventListener('message', function (event) {
    if (event.data.type === 'card_ready') {
      statusIndicator.textContent = 'Card view connected!';
      statusIndicator.className = 'status-indicator connected';
      
      // Send current values to the newly opened card
      cardChannel.postMessage({
        type: 'name',
        value: name.value.length == 0 ? 'JOHN DOE' : name.value
      });
      cardChannel.postMessage({
        type: 'cardnumber',
        value: cardnumber_mask.value.length == 0 ? '0123 4567 8910 1112' : cardnumber_mask.value,
        cardtype: cardnumber_mask.masked.currentMask.cardtype
      });
      cardChannel.postMessage({
        type: 'expiration',
        value: expirationdate_mask.value.length == 0 ? '01/23' : expirationdate_mask.value
      });
      cardChannel.postMessage({
        type: 'security',
        value: securitycode_mask.value.length == 0 ? '985' : securitycode_mask.value
      });
    }
  });

  // Check periodically if card window is closed
  setInterval(function () {
    if (cardWindow && cardWindow.closed) {
      statusIndicator.textContent = 'Card view not open';
      statusIndicator.className = 'status-indicator disconnected';
      cardWindow = null;
    }
  }, 1000);

  // Save to Excel functionality
  const saveExcelBtn = document.getElementById('saveExcelBtn');

  saveExcelBtn.addEventListener('click', async function() {
    // Get current form data
    const formData = {
      Name: name.value || 'JOHN DOE',
      Email: email.value || '',
      CardNumber: cardnumber_mask.value || '0123 4567 8910 1112',
      ExpirationDate: expirationdate_mask.value || '01/23',
      SecurityCode: securitycode_mask.value || '985'
    };

    // Check if email is provided
    if (!email.value) {
      alert('Please enter an email address before saving.');
      email.focus();
      return;
    }

    // Disable button while saving
    saveExcelBtn.disabled = true;
    saveExcelBtn.textContent = 'Saving...';

    try {
      // Send data to server
      const response = await fetch('http://localhost:3000/api/save-card-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (result.success) {
        alert(`Data saved successfully! Total entries: ${result.totalEntries}`);

        // Clear form after successful save
        name.value = '';
        email.value = '';
        cardnumber.value = '';
        expirationdate.value = '';
        securitycode.value = '';

        // Reset masks
        cardnumber_mask.value = '';
        expirationdate_mask.value = '';
        securitycode_mask.value = '';
      } else {
        alert('Error: ' + result.message);
      }
    } catch (error) {
      console.error('Error saving data:', error);
      alert('Failed to save data. Make sure the server is running.\n\nTo start the server, run: npm install && npm start');
    } finally {
      // Re-enable button
      saveExcelBtn.disabled = false;
      saveExcelBtn.textContent = 'Save to Excel';
    }
  });
};

