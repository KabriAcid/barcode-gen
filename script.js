// OOP
class BarcodeGenerator {
  constructor() {
    this.currentStep = 1;
    this.currentBarcode = null;
    this.history = [];
    this.initializeEventListeners();
    // Load server history
    this.fetchHistory();
  }

  initializeEventListeners() {
    // Step 1 listeners
    document
      .getElementById("create-barcode-btn")
      .addEventListener("click", () => {
        this.showBarcodeInput();
      });

    document
      .getElementById("generate-random-btn")
      .addEventListener("click", () => {
        this.generateRandomBarcode();
      });

    document
      .getElementById("next-to-preview-btn")
      .addEventListener("click", () => {
        this.goToPreview();
      });

    // Step 2 listeners
    document.getElementById("print-btn").addEventListener("click", () => {
      this.printBarcode();
    });

    document.getElementById("save-btn").addEventListener("click", () => {
      this.saveBarcode();
    });

    document
      .getElementById("back-to-generator-btn")
      .addEventListener("click", () => {
        this.goToStep(1);
      });

    // Step 3 listeners
    document.getElementById("new-barcode-btn").addEventListener("click", () => {
      this.goToStep(1);
    });

    // Barcode input listener
    document.getElementById("barcode-input").addEventListener("input", (e) => {
      this.validateBarcodeInput(e.target.value);
    });
  }

  showBarcodeInput() {
    document.getElementById("barcode-input-section").classList.remove("hidden");
    document.getElementById("barcode-input").focus();
  }

  generateRandomBarcode() {
    const type = document.getElementById("barcode-type").value;
    let randomValue;

    switch (type) {
      case "EAN13":
        randomValue = this.generateEAN13();
        break;
      case "UPC":
        randomValue = this.generateUPC();
        break;
      case "CODE128":
        randomValue = this.generateCode128();
        break;
      default:
        randomValue = this.generateCode128();
    }

    document.getElementById("barcode-input").value = randomValue;
    this.showBarcodeInput();
    this.validateBarcodeInput(randomValue);
  }

  generateEAN13() {
    let digits = "";
    for (let i = 0; i < 12; i++) {
      digits += Math.floor(Math.random() * 10);
    }
    let sum = 0;
    for (let i = 0; i < 12; i++) {
      sum += parseInt(digits[i]) * (i % 2 === 0 ? 1 : 3);
    }
    const checkDigit = (10 - (sum % 10)) % 10;
    return digits + checkDigit;
  }

  generateUPC() {
    let digits = "";
    for (let i = 0; i < 11; i++) {
      digits += Math.floor(Math.random() * 10);
    }
    let sum = 0;
    for (let i = 0; i < 11; i++) {
      sum += parseInt(digits[i]) * (i % 2 === 0 ? 3 : 1);
    }
    const checkDigit = (10 - (sum % 10)) % 10;
    return digits + checkDigit;
  }

  generateCode128() {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    const length = Math.floor(Math.random() * 8) + 6; // 6-13 characters
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  validateBarcodeInput(value) {
    const type = document.getElementById("barcode-type").value;
    let isValid = false;
    switch (type) {
      case "EAN13":
        isValid = /^\d{13}$/.test(value);
        break;
      case "UPC":
        isValid = /^\d{12}$/.test(value);
        break;
      case "CODE128":
        isValid = value.length >= 1;
        break;
    }
    const nextBtn = document.getElementById("next-to-preview-btn");
    if (isValid && value.trim()) {
      nextBtn.disabled = false;
      nextBtn.classList.remove("opacity-50", "cursor-not-allowed");
    } else {
      nextBtn.disabled = true;
      nextBtn.classList.add("opacity-50", "cursor-not-allowed");
    }
  }

  goToPreview() {
    const value = document.getElementById("barcode-input").value.trim();
    const type = document.getElementById("barcode-type").value;
    if (!value) return;
    this.currentBarcode = {
      value: value,
      type: type,
      timestamp: new Date().toISOString(),
      labelSize: document.getElementById("label-size").value,
      copies: parseInt(document.getElementById("copies-input").value),
    };
    this.generateBarcodeImage();
    this.goToStep(2);
  }

  generateBarcodeImage() {
    const canvas = document.getElementById("barcode-canvas");
    const valueDisplay = document.getElementById("barcode-value-display");
    try {
      JsBarcode(canvas, this.currentBarcode.value, {
        format: this.currentBarcode.type,
        width: 2,
        height: 100,
        displayValue: true,
        fontSize: 14,
        margin: 10,
      });
      valueDisplay.textContent = this.currentBarcode.value;
    } catch (error) {
      console.error("Error generating barcode:", error);
      canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
      valueDisplay.textContent = "Error generating barcode";
    }
  }

  printBarcode() {
    if (!this.currentBarcode) return;
    this.currentBarcode.copies = parseInt(
      document.getElementById("copies-input").value
    );
    this.currentBarcode.labelSize = document.getElementById("label-size").value;
    const printWindow = window.open("", "_blank");
    const canvas = document.getElementById("barcode-canvas");
    printWindow.document.write(`
            <html>
                <head>
                    <title>Print Barcode</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 20px; text-align: center; }
                        .barcode-container { margin: 20px 0; page-break-inside: avoid; }
                        .barcode-value { font-family: monospace; margin-top: 10px; font-size: 14px; }
                        @media print { body { margin: 0; } }
                    </style>
                </head>
                <body>
                    ${Array(this.currentBarcode.copies)
                      .fill()
                      .map(
                        () => `
                        <div class="barcode-container">
                            <img src="${canvas.toDataURL()}" alt="Barcode">
                            <div class="barcode-value">${
                              this.currentBarcode.value
                            }</div>
                        </div>
                    `
                      )
                      .join("")}
                </body>
            </html>
        `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
    this.addToHistory();
    this.goToStep(3);
  }

  saveBarcode() {
    if (!this.currentBarcode) return;
    this.currentBarcode.copies = parseInt(
      document.getElementById("copies-input").value
    );
    this.currentBarcode.labelSize = document.getElementById("label-size").value;
    const canvas = document.getElementById("barcode-canvas");
    const link = document.createElement("a");
    link.download = `barcode-${this.currentBarcode.value}.png`;
    link.href = canvas.toDataURL();
    link.click();
    this.addToHistory();
    this.goToStep(3);
  }

  addToHistory() {
    if (!this.currentBarcode) return;
    const newEntry = { ...this.currentBarcode, id: Date.now() };
    // Optimistic update
    this.history.unshift(newEntry);
    this.history = this.history.slice(0, 200);
    this.updateHistoryDisplay();
    // Persist to server
    fetch("/api/history", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newEntry),
    }).catch((err) => console.error("Failed to save history entry", err));
  }

  async fetchHistory() {
    try {
      const res = await fetch("/api/history");
      if (!res.ok) throw new Error("Failed to load history");
      this.history = await res.json();
      this.updateHistoryDisplay();
    } catch (e) {
      console.warn(
        "History fetch failed, falling back to localStorage if available.",
        e
      );
      try {
        const fallback = JSON.parse(
          localStorage.getItem("barcodeHistory") || "[]"
        );
        if (fallback.length) {
          this.history = fallback;
          this.updateHistoryDisplay();
        }
      } catch {}
    }
  }

  // Allow user to download history as JSON file
  exportHistory() {
    if (!this.history.length) return;
    const blob = new Blob(
      [
        JSON.stringify(
          this.history.map((h) => ({ ...h })),
          null,
          2
        ),
      ],
      { type: "application/json" }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `barcode-history-${new Date()
      .toISOString()
      .slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  updateHistoryDisplay() {
    const historyList = document.getElementById("history-list");
    const emptyHistory = document.getElementById("empty-history");
    if (this.history.length === 0) {
      historyList.classList.add("hidden");
      emptyHistory.classList.remove("hidden");
      return;
    }
    historyList.classList.remove("hidden");
    emptyHistory.classList.add("hidden");
    historyList.innerHTML = this.history
      .map(
        (item) => `
      <div class="barcode-item flex flex-wrap items-center justify-between gap-4 p-4">
        <div class="flex-1 min-w-0">
          <div class="font-mono text-base md:text-lg font-semibold break-all">${
            item.value
          }</div>
          <div class="text-xs md:text-sm text-gray-500">${item.type} • ${
          item.labelSize
        } • ${item.copies} copies</div>
          <div class="text-xs text-gray-400">${new Date(
            item.timestamp
          ).toLocaleDateString()}</div>
        </div>
        <button onclick="app.reprintBarcode(${
          item.id
        })" class="btn-secondary text-xs md:text-sm px-3 md:px-4 py-2 w-full md:w-auto">Reprint</button>
      </div>
    `
      )
      .join("");
  }

  reprintBarcode(id) {
    const item = this.history.find((h) => h.id === id);
    if (!item) return;
    this.currentBarcode = { ...item };
    document.getElementById("barcode-type").value = item.type;
    document.getElementById("barcode-input").value = item.value;
    document.getElementById("label-size").value = item.labelSize;
    document.getElementById("copies-input").value = item.copies;
    this.generateBarcodeImage();
    this.goToStep(2);
  }

  goToStep(step) {
    for (let i = 1; i <= 3; i++) {
      document.getElementById(`step-${i}`).classList.add("hidden");
      document
        .getElementById(`step-indicator-${i}`)
        .classList.remove("bg-primary-500");
      document
        .getElementById(`step-indicator-${i}`)
        .classList.add("bg-gray-300");
    }
    document.getElementById(`step-${step}`).classList.remove("hidden");
    document
      .getElementById(`step-indicator-${step}`)
      .classList.add("bg-primary-500");
    document
      .getElementById(`step-indicator-${step}`)
      .classList.remove("bg-gray-300");
    this.currentStep = step;
    if (step === 1) {
      document.getElementById("barcode-input-section").classList.add("hidden");
      document.getElementById("barcode-input").value = "";
      this.currentBarcode = null;
    }
  }
}

// Initialize the app once DOM is ready
window.addEventListener("DOMContentLoaded", () => {
  window.app = new BarcodeGenerator();
});
