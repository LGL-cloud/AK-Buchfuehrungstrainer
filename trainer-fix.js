const originalCheckAnswer = checkAnswer;

function fixedCheckAnswer() {
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
    showFeedback(
      "Richtig",
      shouldCount
        ? "Der Buchungssatz stimmt."
        : "Der Buchungssatz stimmt. Die Statistik wurde nicht erneut gezählt.",
      "ok"
    );
    return;
  }

  if (shouldCount) {
    state.stats.wrong += 1;
  }
  updateStats();
  showFeedback(
    "Noch nicht richtig",
    `${errors.join(" ")} ${shouldCount ? "" : "Die Statistik wurde nicht erneut gezählt."}`,
    "error"
  );
}

els.checkButton.removeEventListener("click", originalCheckAnswer);
els.checkButton.addEventListener("click", fixedCheckAnswer);

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

function normalizeEntry(entry) {
  return {
    side: entry.side,
    account: extractAccountCode(entry.account),
    amount: entry.amount === null ? null : Number(entry.amount)
  };
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
