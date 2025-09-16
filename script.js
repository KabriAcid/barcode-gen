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
    // History search listener
    const searchInput = document.getElementById("history-search");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        this.updateHistoryDisplay(e.target.value);
      });
    }
    // Step 1 listeners
    const generateBtn = document.getElementById("generate-random-btn");
    if (generateBtn) {
      generateBtn.addEventListener("click", () => {
        // Only generate UPC code and go to preview
        const upc = this.generateUPC();
        document.getElementById("barcode-input").value = upc;
        this.validateBarcodeInput(upc);
        this.goToPreview();
      });
    }
    const showHistoryBtn = document.getElementById("show-history-btn");
    if (showHistoryBtn) {
      showHistoryBtn.addEventListener("click", () => {
        window.location.href = "history.html";
      });
    }
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
    // Only generate UPC code
    const upc = this.generateUPC();
    document.getElementById("barcode-input").value = upc;
    this.showBarcodeInput();
    this.validateBarcodeInput(upc);
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
    // Only validate UPC code
    let isValid = /^\d{12}$/.test(value);
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
    const name = document.getElementById("barcode-name-input").value.trim();
    if (!value) return;
    this.currentBarcode = {
      value: value,
      type: "UPC",
      labelSize: document.getElementById("label-size").value,
      copies: parseInt(document.getElementById("copies-input").value),
      name: name,
    };
    this.generateBarcodeImage();
    this.goToStep(2);
  }

  generateBarcodeImage() {
    const canvas = document.getElementById("barcode-canvas");
    const valueDisplay = document.getElementById("barcode-value-display");
    try {
      JsBarcode(canvas, this.currentBarcode.value, {
        format: "UPC",
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
    const userId = localStorage.getItem("userId");
    const newEntry = { ...this.currentBarcode, id: Date.now(), userId };
    // Optimistic update
    this.history.unshift(newEntry);
    this.history = this.history.slice(0, 200);
    // Persist to server
    fetch("/api/history", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newEntry),
    }).catch((err) => console.error("Failed to save history entry", err));
  }

  async fetchHistory() {
    try {
      const userId = localStorage.getItem("userId");
      const res = await fetch(`/api/history?userId=${userId}`);
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

    // Accept optional search query
    let searchQuery = "";
    if (arguments.length > 0 && typeof arguments[0] === "string") {
      searchQuery = arguments[0].toLowerCase();
    }

    const filteredHistory = this.history.filter((item) => {
      if (!searchQuery) return true;
      return (
        (item.name && item.name.toLowerCase().includes(searchQuery)) ||
        item.value.toLowerCase().includes(searchQuery) ||
        item.type.toLowerCase().includes(searchQuery)
      );
    });

    historyList.innerHTML = filteredHistory
      .map((item) => {
        // Generate a temporary canvas for rendering barcode image
        const tempCanvas = document.createElement("canvas");
        try {
          JsBarcode(tempCanvas, item.value, {
            format: item.type,
            width: 2,
            height: 80,
            displayValue: false,
            margin: 0,
          });
        } catch (e) {
          console.error("Error generating history barcode:", e);
        }

        const barcodeImage = tempCanvas.toDataURL();

        return `
          <div class="p-4 border-b border-gray-200 bg-gray-50 rounded-xl">
            <img src="${barcodeImage}" alt="Barcode" class="h-16 w-auto mx-auto mb-2" />
            <div class="font-mono text-base md:text-lg font-semibold break-all text-gray-800 text-center">${
              item.value
            }${
          item.name
            ? ` <span class='text-sm font-semibold text-primary-500'>${item.name}</span>`
            : ""
        }</div>
            <div class="text-xs md:text-sm text-gray-500 text-center mt-1">${
              item.type
            } <span class="mx-1">•</span> ${
          item.labelSize
        } <span class="mx-1">•</span> ${item.copies} copies</div>
            <div class="text-xs text-gray-400 text-center mb-2">${new Date(
              item.timestamp
            ).toLocaleDateString()}</div>
            <button onclick="app.reprintBarcode(${
              item.id
            })" class="btn-secondary text-xs md:text-sm px-3 py-2 w-full my-3 mb-5">Reprint</button>
          </div>
        `;
      })
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
