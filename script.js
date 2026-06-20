const VAT_RATE = 0.19;

const accounts = [
  ["0200", "Fuhrpark", "Aktiv"],
  ["0210", "Vorführfahrzeuge", "Aktiv"],
  ["0220", "Technische Anlagen und Maschinen", "Aktiv"],
  ["0300", "Betriebs- und Geschäftsausstattung (Gebrauchsgüter)", "Aktiv"],
  ["3000", "Bestand Neuwagen", "Aktiv"],
  ["3100", "Bestand Gebrauchtwagen (regelbesteuert)", "Aktiv"],
  ["3110", "Bestand Gebrauchtwagen (differenzbesteuert)", "Aktiv"],
  ["3200", "Bestand E-Bikes", "Aktiv"],
  ["3250", "Bestand Wallboxen", "Aktiv"],
  ["3300", "Bestand Teile", "Aktiv"],
  ["3400", "Bestand Solaranlagen", "Aktiv"],
  ["1570", "Vorsteuer (Forderung an das Finanzamt)", "Aktiv"],
  ["1400", "Forderungen aus Lieferungen und Leistungen", "Aktiv"],
  ["1200", "Bank", "Aktiv"],
  ["1000", "Kasse", "Aktiv"],
  ["2000", "Eigenkapital", "Passiv"],
  ["1800", "Darlehen", "Passiv"],
  ["1795", "Umsatzsteuer (Verbindlichkeit an das Finanzamt)", "Passiv"],
  ["1796", "Umsatzsteuer auf Tauschteile", "Passiv"],
  ["1600", "Verbindlichkeiten aus Lieferungen und Leistungen", "Passiv"],
  ["7100", "VAK Neuwagen", "Aufwand"],
  ["7110", "VAK Gebrauchtwagen (differenzbesteuert)", "Aufwand"],
  ["7150", "VAK Gebrauchtwagen (regelbesteuert)", "Aufwand"],
  ["7200", "VAK E-Bikes", "Aufwand"],
  ["7250", "VAK Wallboxen", "Aufwand"],
  ["7300", "VAK Teile Theke", "Aufwand"],
  ["7310", "VAK Teile Werkstatt", "Aufwand"],
  ["7400", "VAK Solaranlagen", "Aufwand"],
  ["6010", "Büromaterial (Verbrauchsgüter)", "Aufwand"],
  ["6050", "Portokosten", "Aufwand"],
  ["6300", "Miete", "Aufwand"],
  ["6400", "Versicherungen", "Aufwand"],
  ["6500", "Strom / Energie", "Aufwand"],
  ["6600", "Werbekosten", "Aufwand"],
  ["6800", "sonstige betriebliche Aufwendungen", "Aufwand"],
  ["8000", "Erlöse Neuwagen", "Ertrag"],
  ["8050", "Erlöse Gebrauchtwagen (regelbesteuert)", "Ertrag"],
  ["8110", "Erlöse Gebrauchtwagen (differenzbesteuert)", "Ertrag"],
  ["8111", "Mehrerlöse Differenzbesteuerung", "Ertrag"],
  ["8200", "Erlöse E-Bikes", "Ertrag"],
  ["8250", "Erlöse Wallboxen", "Ertrag"],
  ["8300", "Erlöse Teile", "Ertrag"],
  ["8310", "Erlöse Teile durch die Werkstatt", "Ertrag"],
  ["8400", "Erlöse Solaranlagen", "Ertrag"],
  ["8500", "Lohnerlöse Werkstatt", "Ertrag"],
  ["8600", "sonstige betriebliche Erträge", "Ertrag"],
  ["8610", "Zinserträge", "Ertrag"],
  ["8620", "Erträge aus Anlagenverkäufen", "Ertrag"]
];

const state = {
  taskNumber: 0,
  currentTask: null,
  currentModule: "standard",
  checkedCurrentTask: false,
  stats: {
    checked: 0,
    right: 0,
    wrong: 0
  }
};

const els = {
  taskMeta: document.querySelector("#taskMeta"),
  taskText: document.querySelector("#taskText"),
  hintBox: document.querySelector("#hintBox"),
  accountTemplate: document.querySelector("#accountInputTemplate"),
  amountTemplate: document.querySelector("#amountInputTemplate"),
  accountOptions: document.querySelector("#accountOptions"),
  bookingGroups: document.querySelector("#bookingGroups"),
  moduleButtons: [...document.querySelectorAll("[data-module]")],
  checkButton: document.querySelector("#checkButton"),
  nextButton: document.querySelector("#nextButton"),
  solutionButton: document.querySelector("#solutionButton"),
  hintButton: document.querySelector("#hintButton"),
  feedback: document.querySelector("#feedback"),
  taskCount: document.querySelector("#taskCount"),
  rightCount: document.querySelector("#rightCount"),
  wrongCount: document.querySelector("#wrongCount")
};

const randomTaskTemplates = [
  randomNewCarSale,
  randomUsedCarSale,
  randomEbikeSale,
  randomWallboxSale,
  randomPartsSale,
  randomSolarSale,
  randomWorkshopRevenue,
  randomNewCarPurchase,
  randomUsedCarPurchase,
  randomEbikePurchase,
  randomWallboxPurchase,
  randomPartsPurchase,
  randomSolarPurchase,
  randomOfficeSupplies,
  randomAdvertisingInvoice,
  randomEnergyPayment,
  randomRentPayment,
  randomInsurancePayment,
  randomCustomerPayment,
  randomSupplierPayment,
  randomVatPayment,
  randomInterestRevenue
];

const specialTaskTemplates = [
  randomPurchaseDiscountPayment,
  randomSalesDiscountPayment,
  randomMarginTaxUsedCarSale,
  randomMarginTaxUsedCarPurchase,
  randomExchangePartSale
];

const moduleConfigs = {
  standard: {
    label: "Grundfälle",
    templates: randomTaskTemplates
  },
  special: {
    label: "Sonderfälle",
    templates: specialTaskTemplates
  },
  discountPurchase: {
    label: "Skonto Einkauf",
    templates: [randomPurchaseDiscountPayment]
  },
  discountSale: {
    label: "Skonto Verkauf",
    templates: [randomSalesDiscountPayment]
  },
  marginTax: {
    label: "Differenzbesteuerung",
    templates: [randomMarginTaxUsedCarSale, randomMarginTaxUsedCarPurchase]
  },
  exchangeParts: {
    label: "Tauschteile",
    templates: [randomExchangePartSale]
  }
};

function line(side, account, amount) {
  return { side, account, amount };
}

function init() {
  renderAccountOptions();
  bindEvents();
  showNextTask();
  updateStats();
}

function bindEvents() {
  els.moduleButtons.forEach((button) => {
    button.addEventListener("click", () => setModule(button.dataset.module));
  });
  els.checkButton.addEventListener("click", checkAnswer);
  els.nextButton.addEventListener("click", showNextTask);
  els.solutionButton.addEventListener("click", showSolution);
  els.hintButton.addEventListener("click", toggleHint);
}

function setModule(moduleName) {
  state.currentModule = moduleConfigs[moduleName] ? moduleName : "standard";
  state.taskNumber = 0;
  state.stats = {
    checked: 0,
    right: 0,
    wrong: 0
  };
  els.moduleButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.module === state.currentModule);
  });
  updateStats();
  showNextTask();
}

function currentModuleConfig() {
  return moduleConfigs[state.currentModule] || moduleConfigs.standard;
}

function showNextTask() {
  state.taskNumber += 1;
  state.checkedCurrentTask = false;
  state.currentTask = createRandomTask();
  els.taskMeta.textContent = `${currentModuleConfig().label} · Aufgabe ${state.taskNumber}`;
  els.taskText.textContent = state.currentTask.text;
  els.hintBox.hidden = true;
  els.hintBox.textContent = state.currentTask.hint;
  resetBookingLines();
  hideFeedback();
}

function createRandomTask() {
  const templates = currentModuleConfig().templates;
  const task = pick(templates)();
  return {
    ...task,
    id: `task-${Date.now()}-${Math.random().toString(16).slice(2)}`
  };
}

function resetBookingLines() {
  els.bookingGroups.innerHTML = "";
  getTaskBookings().forEach((booking, groupIndex) => {
    els.bookingGroups.appendChild(createBookingGroup(booking, groupIndex));
  });
}

function createBookingGroup(booking, groupIndex) {
  const group = document.createElement("section");
  group.className = "booking-group";
  group.dataset.group = groupIndex;

  const title = document.createElement("h3");
  title.className = "booking-group-title";
  title.textContent = booking.title || `Buchungssatz ${groupIndex + 1}`;

  const area = document.createElement("div");
  area.className = "booking-area";

  const debitColumn = createColumn("Soll-Konto", "debit-lines");
  const debitAmountColumn = createColumn("Soll-Betrag", "debit-amounts");
  const creditColumn = createColumn("Haben-Konto", "credit-lines");
  const creditAmountColumn = createColumn("Haben-Betrag", "credit-amounts");

  const rowCount = rowsForBooking(booking);
  for (let row = 0; row < rowCount; row += 1) {
    addAccountInput(debitColumn.lines);
    addAmountInput(debitAmountColumn.lines);
    addAccountInput(creditColumn.lines);
    addAmountInput(creditAmountColumn.lines);
  }

  area.append(debitColumn.column, debitAmountColumn.column, creditColumn.column, creditAmountColumn.column);
  group.append(title, area);
  return group;
}

function createColumn(titleText, className) {
  const column = document.createElement("div");
  column.className = className.includes("amount") ? "amount-column" : "booking-column";

  const title = document.createElement("h3");
  title.textContent = titleText;

  const lines = document.createElement("div");
  lines.className = className.includes("amount") ? "amount-lines" : "side-lines";
  lines.dataset.lines = className;

  column.append(title, lines);
  return { column, lines };
}

function rowsForBooking(booking) {
  const debitCount = booking.solution.filter((entry) => entry.side === "debit").length;
  const creditCount = booking.solution.filter((entry) => entry.side === "credit").length;
  return Math.max(debitCount, creditCount, 1);
}

function addAccountInput(container, value = "") {
  const input = els.accountTemplate.content.firstElementChild.cloneNode(true);
  input.value = value;
  container.appendChild(input);
}

function addAmountInput(container, value = "") {
  const field = els.amountTemplate.content.firstElementChild.cloneNode(true);
  field.querySelector("input").value = value;
  container.appendChild(field);
}

function renderAccountOptions() {
  els.accountOptions.innerHTML = accounts
    .map(([code, name, type]) => `<option value="${code} ${name}" label="${type}"></option>`)
    .join("");
}

function checkAnswer() {
  const errors = validateBookings(readEntryBookings(), getTaskBookings());
  const shouldCount = !state.checkedCurrentTask;
  state.checkedCurrentTask = true;

  if (shouldCount) {
    state.stats.checked += 1;
  }

  if (errors.length === 0) {
    if (shouldCount) {
      state.stats.right += 1;
    }
    updateStats();
    showFeedback("Richtig", shouldCount ? "Der Buchungssatz stimmt." : "Der Buchungssatz stimmt. Die Statistik wurde nicht erneut gezählt.", "ok");
    return;
  }

  if (shouldCount) {
    state.stats.wrong += 1;
  }
  updateStats();
  showFeedback("Noch nicht richtig", `${errors.join(" ")} ${shouldCount ? "" : "Die Statistik wurde nicht erneut gezählt."}`, "error");
}
function validateBookings(userBookings, expectedBookings) {
  const errors = [];

  expectedBookings.forEach((booking, index) => {
    const bookingErrors = validateLines(userBookings[index] || [], booking.solution, booking.title);
    errors.push(...bookingErrors);
  });

  return errors;
}

function validateLines(userLines, solution, bookingTitle = "Buchungssatz") {
  const errors = [];
  const filled = userLines.filter((entry) => entry.account || entry.amount !== null);
  const normalizedUser = filled.map(normalizeEntry);
  const normalizedSolution = solution.map(normalizeEntry);
  const usedUserIndexes = new Set();

  const unknownAccounts = normalizedUser.filter((entry) => entry.account && !findAccount(entry.account));
  if (unknownAccounts.length > 0) {
    errors.push(`${bookingTitle}: Mindestens eine Kontonummer ist nicht im Kontenplan enthalten.`);
  }

  normalizedSolution.forEach((expected) => {
    const matchIndex = normalizedUser.findIndex((entry, index) => (
      !usedUserIndexes.has(index) &&
      entry.side === expected.side &&
      entry.account === expected.account &&
      amountsEqual(entry.amount, expected.amount)
    ));

    if (matchIndex >= 0) {
      usedUserIndexes.add(matchIndex);
    } else {
      const side = expected.side === "debit" ? "Soll" : "Haben";
      errors.push(`${bookingTitle}: ${side}: ${accountLabel(expected.account)} mit ${formatAmount(expected.amount)} EUR fehlt oder ist falsch.`);
    }
  });

  const extraLines = normalizedUser.filter((entry, index) => !usedUserIndexes.has(index) && (entry.account || entry.amount !== null));
  if (extraLines.length > 0) {
    errors.push(`${bookingTitle}: Es ist mindestens eine zusätzliche oder falsch ausgefüllte Zeile vorhanden.`);
  }

  return errors;
}

function readEntryBookings() {
  return [...els.bookingGroups.querySelectorAll(".booking-group")].map((group) => [
    ...readSideRows("debit", group.querySelector('[data-lines="debit-lines"]'), group.querySelector('[data-lines="debit-amounts"]')),
    ...readSideRows("credit", group.querySelector('[data-lines="credit-lines"]'), group.querySelector('[data-lines="credit-amounts"]'))
  ]);
}

function readSideRows(side, accountContainer, amountContainer) {
  const accountInputs = [...accountContainer.querySelectorAll(".account-input")];
  const amountInputs = [...amountContainer.querySelectorAll(".amount-input")];

  return accountInputs.map((accountInput, index) => ({
    side,
    account: extractAccountCode(accountInput.value),
    amount: parseAmount(amountInputs[index]?.value)
  }));
}

function normalizeEntry(entry) {
  return {
    side: entry.side,
    account: extractAccountCode(entry.account),
    amount: entry.amount === null ? null : Number(entry.amount)
  };
}

function showSolution() {
  resetBookingLines();
  getTaskBookings().forEach((booking, groupIndex) => {
    const group = els.bookingGroups.querySelector(`.booking-group[data-group="${groupIndex}"]`);
    fillSolutionSide(group, "debit", booking.solution.filter((entry) => entry.side === "debit"));
    fillSolutionSide(group, "credit", booking.solution.filter((entry) => entry.side === "credit"));
  });
  showFeedback("Lösung", solutionMarkup(getTaskBookings()), "ok", true);
}

function fillSolutionSide(group, side, entries) {
  const accountInputs = [...group.querySelector(`[data-lines="${side}-lines"]`).querySelectorAll(".account-input")];
  const amountInputs = [...group.querySelector(`[data-lines="${side}-amounts"]`).querySelectorAll(".amount-input")];

  entries.forEach((entry, index) => {
    accountInputs[index].value = accountLabel(entry.account);
    amountInputs[index].value = formatAmount(entry.amount);
  });
}

function solutionMarkup(bookings) {
  return bookings.map((booking) => {
    const items = booking.solution.map((entry) => {
      const side = entry.side === "debit" ? "Soll" : "Haben";
      return `<li>${side}: ${accountLabel(entry.account)} · ${formatAmount(entry.amount)} EUR</li>`;
    }).join("");
    return `<h4>${booking.title}</h4><ol class="solution-lines">${items}</ol>`;
  }).join("");
}

function toggleHint() {
  els.hintBox.hidden = !els.hintBox.hidden;
}

function showFeedback(title, body, type, isHtml = false) {
  els.feedback.className = `feedback show ${type}`;
  els.feedback.innerHTML = `<h3>${title}</h3>${isHtml ? body : `<p>${body}</p>`}`;
}

function hideFeedback() {
  els.feedback.className = "feedback";
  els.feedback.innerHTML = "";
}

function updateStats() {
  els.taskCount.textContent = state.stats.checked;
  els.rightCount.textContent = state.stats.right;
  els.wrongCount.textContent = state.stats.wrong;
}

function getTaskBookings() {
  if (state.currentTask.bookings) {
    return state.currentTask.bookings;
  }

  return [{
    title: "Buchungssatz",
    solution: state.currentTask.solution
  }];
}

function saleWithStock({ item, revenue, stock, vak, min, max, step, costRate, cash = false }) {
  const amount = taxableAmount(randomAmount(min, max, step));
  const stockValue = money(amount.net * costRate);
  return {
    text: `${cash ? "Barverkauf" : "Verkauf auf Ziel"}: ${item}. Verkaufspreis ${amount.phrase}. Der Bestand wird mit ${formatAmount(stockValue)} EUR ausgebucht.`,
    hint: `Erst den Verkauf buchen: ${cash ? "Kasse" : "Forderungen"} an Erlöse und Umsatzsteuer. Danach getrennt die Lagerentnahme buchen: VAK an Bestand.`,
    bookings: [
      {
        title: "1. Buchungssatz: Verkauf",
        solution: [
          line("debit", cash ? "1000" : "1400", amount.gross),
          line("credit", revenue, amount.net),
          line("credit", "1795", amount.tax)
        ]
      },
      {
        title: "2. Buchungssatz: Lagerentnahme / Wareneinsatz aus dem Bestand buchen",
        solution: [
          line("debit", vak, stockValue),
          line("credit", stock, stockValue)
        ]
      }
    ]
  };
}

function purchaseToStock({ item, stock, min, max, step }) {
  const amount = taxableAmount(randomAmount(min, max, step));
  return {
    text: `Einkauf auf Ziel: ${item}. Eingangsrechnung ${amount.phrase}.`,
    hint: "Bestand und Vorsteuer stehen im Soll. Verbindlichkeiten stehen im Haben.",
    solution: [
      line("debit", stock, amount.net),
      line("debit", "1570", amount.tax),
      line("credit", "1600", amount.gross)
    ]
  };
}

function purchaseDiscountPayment({ item, stock, min, max, step, discountRate }) {
  const amount = taxableAmount(randomAmount(min, max, step));
  const discountGross = money(amount.gross * discountRate);
  const discountNet = money(discountGross / (1 + VAT_RATE));
  const discountTax = money(discountGross - discountNet);
  const bankPayment = money(amount.gross - discountGross);
  const discountPercent = formatPercent(discountRate);

  return {
    text: `Wir begleichen eine bereits gebuchte Eingangsrechnung für ${item} per Banküberweisung. Rechnungsbetrag: ${formatAmount(amount.gross)} EUR brutto. Es werden ${discountPercent} Skonto abgezogen. Buchen Sie die Zahlung mit Skonto im Einkauf. Das Skonto wird direkt über das Bestandskonto korrigiert.`,
    hint: "Beim Skonto im Einkauf wird kein Unterkonto Lieferantenskonto verwendet. Die Verbindlichkeit wird vollständig ausgebucht. Im Haben stehen Bank, das passende Bestandskonto und die Vorsteuerkorrektur.",
    solution: [
      line("debit", "1600", amount.gross),
      line("credit", "1200", bankPayment),
      line("credit", stock, discountNet),
      line("credit", "1570", discountTax)
    ]
  };
}

function salesDiscountPayment({ item, revenue, min, max, step, discountRate }) {
  const amount = taxableAmount(randomAmount(min, max, step));
  const discountGross = money(amount.gross * discountRate);
  const discountNet = money(discountGross / (1 + VAT_RATE));
  const discountTax = money(discountGross - discountNet);
  const bankReceipt = money(amount.gross - discountGross);
  const discountPercent = formatPercent(discountRate);

  return {
    text: `Ein Kunde begleicht eine bereits gebuchte Ausgangsrechnung für ${item} per Banküberweisung. Rechnungsbetrag: ${formatAmount(amount.gross)} EUR brutto. Der Kunde zieht ${discountPercent} Skonto ab. Buchen Sie den Zahlungseingang mit Skonto im Verkauf. Das Skonto wird direkt über das Erlöskonto korrigiert.`,
    hint: "Beim Skonto im Verkauf wird die Forderung vollständig ausgebucht. Im Soll stehen Bank, das passende Erlöskonto als Erlöskorrektur und die Umsatzsteuerkorrektur.",
    solution: [
      line("debit", "1200", bankReceipt),
      line("debit", revenue, discountNet),
      line("debit", "1795", discountTax),
      line("credit", "1400", amount.gross)
    ]
  };
}

function marginTaxSale({ item, stock, vak, revenue, minCost, maxCost, step, marginRate, cash = false }) {
  const cost = randomAmount(minCost, maxCost, step);
  const marginGross = money(cost * marginRate);
  const taxOnMargin = money(marginGross * VAT_RATE / (1 + VAT_RATE));
  const sellingPrice = money(cost + marginGross);
  const extraRevenue = money(marginGross - taxOnMargin);

  return {
    text: `${cash ? "Barverkauf" : "Verkauf auf Ziel"}: ${item} wird differenzbesteuert verkauft. Einkaufspreis und Buchwert des Fahrzeugs: ${formatAmount(cost)} EUR. Verkaufspreis: ${formatAmount(sellingPrice)} EUR. Die Umsatzsteuer ist nur aus der Differenz zwischen Verkaufspreis und Einkaufspreis zu berechnen.`,
    hint: "Bei der Differenzbesteuerung wird die Umsatzsteuer nur aus der Handelsspanne berechnet. Der Verkauf wird auf Erlöse GW differenzbesteuert, Mehrerlöse Differenzbesteuerung und Umsatzsteuer aufgeteilt. Danach wird der Bestand über VAK an Bestand ausgebucht.",
    bookings: [
      {
        title: "1. Buchungssatz: Verkauf differenzbesteuert",
        solution: [
          line("debit", cash ? "1000" : "1400", sellingPrice),
          line("credit", revenue, cost),
          line("credit", "8111", extraRevenue),
          line("credit", "1795", taxOnMargin)
        ]
      },
      {
        title: "2. Buchungssatz: Lagerentnahme / Wareneinsatz aus dem Bestand buchen",
        solution: [
          line("debit", vak, cost),
          line("credit", stock, cost)
        ]
      }
    ]
  };
}

function marginTaxPurchase({ item, stock, min, max, step, payment }) {
  const amount = randomAmount(min, max, step);
  const creditAccount = payment === "cash"
    ? "1000"
    : payment === "bank"
      ? "1200"
      : "1600";
  const paymentText = payment === "cash"
    ? "bar"
    : payment === "bank"
      ? "per Banküberweisung"
      : "auf Ziel";

  return {
    text: `Wir kaufen von einer Privatkundin bzw. einem Privatkunden ${item} differenzbesteuert ${paymentText} an. Kaufpreis: ${formatAmount(amount)} EUR. Es fällt keine Vorsteuer an.`,
    hint: "Beim Ankauf von privat gibt es keine Vorsteuer. Der differenzbesteuerte Bestand wird im Soll gebucht; je nach Zahlungsart steht Kasse, Bank oder Verbindlichkeiten im Haben.",
    solution: [
      line("debit", stock, amount),
      line("credit", creditAccount, amount)
    ]
  };
}

function exchangePartSale({ item, partNet, laborNet, stockValue }) {
  const normalVat = vat(money(partNet + laborNet));
  const exchangeValue = money(partNet * 0.1);
  const exchangePartVat = vat(exchangeValue);
  const receivable = money(partNet + laborNet + normalVat + exchangePartVat);

  return {
    text: `Verkauf auf Ziel: ${item} wird durch die Werkstatt eingebaut. Teilewert ${formatAmount(partNet)} EUR netto, Lohnanteil ${formatAmount(laborNet)} EUR netto. Zusätzlich ist Umsatzsteuer auf Tauschteile zu buchen: 10 % des Teileerlöses dienen als Bemessungsgrundlage. Der Bestand wird mit ${formatAmount(stockValue)} EUR ausgebucht.`,
    hint: "Beim Verkauf von Tauschteilen über die Werkstatt werden Teileerlös, Lohnerlös, normale Umsatzsteuer und Umsatzsteuer auf Tauschteile getrennt gebucht. Die Umsatzsteuer auf Tauschteile beträgt 19 % von 10 % des Teileerlöses. Danach folgt die Lagerentnahme: VAK Teile Werkstatt an Bestand Teile.",
    bookings: [
      {
        title: "1. Buchungssatz: Verkauf Tauschteil",
        solution: [
          line("debit", "1400", receivable),
          line("credit", "8310", partNet),
          line("credit", "8500", laborNet),
          line("credit", "1795", normalVat),
          line("credit", "1796", exchangePartVat)
        ]
      },
      {
        title: "2. Buchungssatz: Lagerentnahme / Wareneinsatz aus dem Bestand buchen",
        solution: [
          line("debit", "7310", stockValue),
          line("credit", "3300", stockValue)
        ]
      }
    ]
  };
}

function randomNewCarSale() {
  return saleWithStock({
    item: "ein Neuwagen",
    revenue: "8000",
    stock: "3000",
    vak: "7100",
    min: 24500,
    max: 69000,
    step: 500,
    costRate: 0.78
  });
}

function randomUsedCarSale() {
  return saleWithStock({
    item: "ein regelbesteuerter Gebrauchtwagen",
    revenue: "8050",
    stock: "3100",
    vak: "7150",
    min: 8500,
    max: 36500,
    step: 500,
    costRate: 0.82
  });
}

function randomEbikeSale() {
  return saleWithStock({
    item: "ein E-Bike",
    revenue: "8200",
    stock: "3200",
    vak: "7200",
    min: 1450,
    max: 6900,
    step: 50,
    costRate: 0.68
  });
}

function randomWallboxSale() {
  return saleWithStock({
    item: "eine Wallbox",
    revenue: "8250",
    stock: "3250",
    vak: "7250",
    min: 650,
    max: 2600,
    step: 50,
    costRate: 0.7
  });
}

function randomPartsSale() {
  return saleWithStock({
    item: "Ersatzteile an der Theke",
    revenue: "8300",
    stock: "3300",
    vak: "7300",
    min: 35,
    max: 950,
    step: 5,
    costRate: 0.62,
    cash: true
  });
}

function randomSolarSale() {
  return saleWithStock({
    item: "eine Solaranlage",
    revenue: "8400",
    stock: "3400",
    vak: "7400",
    min: 6500,
    max: 31500,
    step: 250,
    costRate: 0.74
  });
}

function randomWorkshopRevenue() {
  const amount = taxableAmount(randomAmount(120, 1800, 20));
  return {
    text: `Eine Werkstattleistung wird einem Kunden auf Ziel berechnet: ${amount.phrase}.`,
    hint: "Forderungen stehen im Soll. Lohnerlöse Werkstatt und Umsatzsteuer stehen im Haben.",
    solution: [
      line("debit", "1400", amount.gross),
      line("credit", "8500", amount.net),
      line("credit", "1795", amount.tax)
    ]
  };
}

function randomNewCarPurchase() {
  return purchaseToStock({ item: "ein Neuwagen", stock: "3000", min: 18000, max: 57000, step: 500 });
}

function randomUsedCarPurchase() {
  return purchaseToStock({ item: "ein regelbesteuerter Gebrauchtwagen", stock: "3100", min: 5500, max: 28500, step: 500 });
}

function randomEbikePurchase() {
  return purchaseToStock({ item: "E-Bikes", stock: "3200", min: 900, max: 6200, step: 100 });
}

function randomWallboxPurchase() {
  return purchaseToStock({ item: "Wallboxen", stock: "3250", min: 550, max: 1850, step: 50 });
}

function randomPartsPurchase() {
  return purchaseToStock({ item: "Ersatzteile", stock: "3300", min: 450, max: 6800, step: 50 });
}

function randomSolarPurchase() {
  return purchaseToStock({ item: "Solaranlagen", stock: "3400", min: 4500, max: 24000, step: 250 });
}

function randomPurchaseDiscountPayment() {
  const cases = [
    { item: "Ersatzteile", stock: "3300", min: 1200, max: 9800, step: 100 },
    { item: "Wallboxen", stock: "3250", min: 900, max: 4200, step: 100 },
    { item: "E-Bikes", stock: "3200", min: 1800, max: 12500, step: 100 },
    { item: "Solaranlagen", stock: "3400", min: 6500, max: 36000, step: 250 },
    { item: "einen Neuwagen", stock: "3000", min: 24500, max: 65000, step: 500 },
    { item: "einen regelbesteuerten Gebrauchtwagen", stock: "3100", min: 8500, max: 32000, step: 500 }
  ];
  return purchaseDiscountPayment({
    ...pick(cases),
    discountRate: pick([0.02, 0.03])
  });
}

function randomSalesDiscountPayment() {
  const cases = [
    { item: "Ersatzteile an der Theke", revenue: "8300", min: 450, max: 6800, step: 50 },
    { item: "Wallboxen", revenue: "8250", min: 900, max: 5200, step: 100 },
    { item: "E-Bikes", revenue: "8200", min: 1800, max: 12500, step: 100 },
    { item: "eine Solaranlage", revenue: "8400", min: 6500, max: 36000, step: 250 },
    { item: "einen Neuwagen", revenue: "8000", min: 24500, max: 69000, step: 500 },
    { item: "einen regelbesteuerten Gebrauchtwagen", revenue: "8050", min: 8500, max: 36500, step: 500 },
    { item: "eine Werkstattleistung", revenue: "8500", min: 450, max: 3800, step: 50 }
  ];
  return salesDiscountPayment({
    ...pick(cases),
    discountRate: pick([0.02, 0.03])
  });
}

function randomMarginTaxUsedCarSale() {
  return marginTaxSale({
    item: "ein gebrauchter Pkw",
    stock: "3110",
    vak: "7110",
    revenue: "8110",
    minCost: 4500,
    maxCost: 28000,
    step: 500,
    marginRate: pick([0.12, 0.15, 0.18, 0.2, 0.25]),
    cash: false
  });
}

function randomMarginTaxUsedCarPurchase() {
  return marginTaxPurchase({
    item: "einen gebrauchten Pkw",
    stock: "3110",
    min: 3500,
    max: 26000,
    step: 500,
    payment: pick(["cash", "bank", "target"])
  });
}

function randomExchangePartSale() {
  const cases = [
    { item: "ein aufbereiteter Austauschmotor", partMin: 1800, partMax: 5200, laborMin: 450, laborMax: 1600, costRate: 0.64 },
    { item: "ein aufbereitetes Austauschgetriebe", partMin: 1400, partMax: 4200, laborMin: 420, laborMax: 1400, costRate: 0.62 },
    { item: "ein aufbereiteter Turbolader als Tauschteil", partMin: 650, partMax: 2100, laborMin: 220, laborMax: 820, costRate: 0.6 },
    { item: "eine aufbereitete Lichtmaschine als Tauschteil", partMin: 280, partMax: 980, laborMin: 120, laborMax: 420, costRate: 0.58 }
  ];
  const selected = pick(cases);
  const partNet = randomAmount(selected.partMin, selected.partMax, 50);
  const laborNet = randomAmount(selected.laborMin, selected.laborMax, 20);
  const stockValue = money(partNet * selected.costRate);

  return exchangePartSale({
    item: selected.item,
    partNet,
    laborNet,
    stockValue
  });
}

function randomOfficeSupplies() {
  const amount = taxableAmount(randomAmount(45, 650, 5));
  return {
    text: `Eingangsrechnung für Büromaterial: ${amount.phrase}.`,
    hint: "Büromaterial und Vorsteuer stehen im Soll. Verbindlichkeiten stehen im Haben.",
    solution: [
      line("debit", "6010", amount.net),
      line("debit", "1570", amount.tax),
      line("credit", "1600", amount.gross)
    ]
  };
}

function randomAdvertisingInvoice() {
  const amount = taxableAmount(randomAmount(120, 3200, 20));
  return {
    text: `Eine Werbeleistung wird in Rechnung gestellt: ${amount.phrase}.`,
    hint: "Werbekosten und Vorsteuer stehen im Soll. Verbindlichkeiten stehen im Haben.",
    solution: [
      line("debit", "6600", amount.net),
      line("debit", "1570", amount.tax),
      line("credit", "1600", amount.gross)
    ]
  };
}

function randomEnergyPayment() {
  const amount = taxableAmount(randomAmount(300, 4200, 50));
  return {
    text: `Die Stromrechnung wird per Bank bezahlt: ${amount.phrase}.`,
    hint: "Strom/Energie und Vorsteuer stehen im Soll. Die Bank steht im Haben.",
    solution: [
      line("debit", "6500", amount.net),
      line("debit", "1570", amount.tax),
      line("credit", "1200", amount.gross)
    ]
  };
}

function randomRentPayment() {
  const amount = randomAmount(1500, 7800, 100);
  return {
    text: `Die Monatsmiete für Verkaufs- und Werkstatträume wird per Bank überwiesen: ${formatAmount(amount)} EUR. Keine Umsatzsteuer.`,
    hint: "Miete ist Aufwand. Die Bank nimmt im Haben ab.",
    solution: [
      line("debit", "6300", amount),
      line("credit", "1200", amount)
    ]
  };
}

function randomInsurancePayment() {
  const amount = randomAmount(420, 2600, 20);
  return {
    text: `Die betriebliche Versicherung wird per Bank überwiesen: ${formatAmount(amount)} EUR. Keine Umsatzsteuer.`,
    hint: "Versicherungen sind Aufwand. Die Bank nimmt im Haben ab.",
    solution: [
      line("debit", "6400", amount),
      line("credit", "1200", amount)
    ]
  };
}

function randomCustomerPayment() {
  const amount = randomAmount(1200, 42000, 100);
  return {
    text: `Ein Kunde begleicht eine bereits gebuchte Rechnung über ${formatAmount(amount)} EUR durch Banküberweisung. Es erfolgt keine erneute Umsatzsteuerbuchung.`,
    hint: "Bank nimmt zu, Forderungen nehmen ab.",
    solution: [
      line("debit", "1200", amount),
      line("credit", "1400", amount)
    ]
  };
}

function randomSupplierPayment() {
  const amount = randomAmount(950, 38000, 100);
  return {
    text: `Wir bezahlen eine bereits gebuchte Lieferantenrechnung über ${formatAmount(amount)} EUR per Banküberweisung. Es erfolgt keine erneute Umsatzsteuerbuchung.`,
    hint: "Verbindlichkeiten nehmen im Soll ab, Bank nimmt im Haben ab.",
    solution: [
      line("debit", "1600", amount),
      line("credit", "1200", amount)
    ]
  };
}

function randomVatPayment() {
  const amount = randomAmount(750, 9500, 50);
  return {
    text: `Die Umsatzsteuer-Zahllast in Höhe von ${formatAmount(amount)} EUR wird per Bank an das Finanzamt überwiesen. Keine Umsatzsteuer.`,
    hint: "Die Umsatzsteuerverbindlichkeit nimmt im Soll ab. Die Bank nimmt im Haben ab.",
    solution: [
      line("debit", "1795", amount),
      line("credit", "1200", amount)
    ]
  };
}

function randomInterestRevenue() {
  const amount = randomAmount(20, 360, 10);
  return {
    text: `Die Bank schreibt Zinserträge in Höhe von ${formatAmount(amount)} EUR gut. Keine Umsatzsteuer.`,
    hint: "Die Bank nimmt im Soll zu. Zinserträge stehen im Haben.",
    solution: [
      line("debit", "1200", amount),
      line("credit", "8610", amount)
    ]
  };
}

function taxableAmount(net) {
  const mode = pick(["net", "gross"]);
  if (mode === "net") {
    const taxValue = vat(net);
    return {
      net,
      tax: taxValue,
      gross: money(net + taxValue),
      phrase: `${formatAmount(net)} EUR netto zuzüglich 19 % Umsatzsteuer`
    };
  }

  const grossValue = money(net * (1 + VAT_RATE));
  const netValue = money(grossValue / (1 + VAT_RATE));
  const taxValue = money(grossValue - netValue);
  return {
    net: netValue,
    tax: taxValue,
    gross: grossValue,
    phrase: `${formatAmount(grossValue)} EUR brutto inklusive 19 % Umsatzsteuer`
  };
}

function randomAmount(min, max, step) {
  const steps = Math.floor((max - min) / step);
  return money(min + randomInt(0, steps) * step);
}

function vat(net) {
  return money(net * VAT_RATE);
}

function money(value) {
  return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
}

function pick(items) {
  return items[randomInt(0, items.length - 1)];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function accountName(code) {
  const account = accounts.find(([accountCode]) => accountCode === code);
  return account ? account[1] : code;
}

function accountLabel(code) {
  const account = findAccount(code);
  return account ? `${account[0]} ${account[1]}` : code;
}

function findAccount(code) {
  const normalizedCode = extractAccountCode(code);
  return accounts.find(([accountCode]) => accountCode === normalizedCode);
}

function extractAccountCode(value) {
  const match = String(value || "").match(/\d{4}/);
  return match ? match[0] : "";
}

function parseAmount(value) {
  const raw = String(value || "")
    .trim()
    .replace(/[€\s']/g, "");
  if (!raw) {
    return null;
  }

  let normalized = raw;
  if (normalized.includes(",")) {
    normalized = normalized.replace(/\./g, "").replace(",", ".");
  } else if (normalized.includes(".")) {
    const parts = normalized.split(".");
    const lastPart = parts[parts.length - 1];
    normalized = parts.length === 2 && lastPart.length <= 2
      ? normalized
      : normalized.replace(/\./g, "");
  }

  if (!normalized) {
    return null;
  }
  if (!/^-?\d+(\.\d+)?$/.test(normalized)) {
    return null;
  }
  const amount = Number.parseFloat(normalized);
  return Number.isFinite(amount) ? amount : null;
}

function formatAmount(value) {
  return Number(value || 0).toLocaleString("de-DE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function formatPercent(value) {
  return Number(value * 100).toLocaleString("de-DE", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }) + " %";
}

function sumBySide(lines, side) {
  return lines
    .filter((entry) => entry.side === side)
    .reduce((sum, entry) => sum + (entry.amount || 0), 0);
}

function amountsEqual(left, right) {
  if (left === null || right === null) {
    return false;
  }
  return Math.round(Number(left) * 100) === Math.round(Number(right) * 100);
}

init();

