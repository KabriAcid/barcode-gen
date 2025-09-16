// OOP
class BarcodeGenerator {
  constructor() {
    this.currentBarcode = null;
    this.initializeEventListeners();
  }

  initializeEventListeners() {
    const generateBtn = document.getElementById("generate-random-btn");
    if (generateBtn) {
      generateBtn.addEventListener("click", async () => {
        const upc = this.generateUPC();
        const name =
          document.getElementById("barcode-name-input")?.value?.trim() || "";
        this.currentBarcode = {
          value: upc,
          type: "UPC",
          labelSize: document.getElementById("label-size")?.value || "30mm",
          copies: parseInt(document.getElementById("copies-input")?.value) || 1,
          name: name,
        };
        this.generateBarcodeImage();
        // Show name in preview
        const nameDisplay = document.getElementById("barcode-name-display");
        if (nameDisplay) nameDisplay.textContent = name;
        this.showPreview();
        // Save to DB
        const userId = localStorage.getItem("userId");
        if (userId) {
          try {
            const res = await fetch("/api/history", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                userId,
                value: upc,
                name,
                labelSize: this.currentBarcode.labelSize,
                copies: this.currentBarcode.copies,
              }),
            });
            if (res.ok) {
              const feedback = document.getElementById("save-feedback");
              if (feedback) {
                feedback.classList.remove("hidden");
                setTimeout(() => feedback.classList.add("hidden"), 2000);
              }
            }
          } catch {}
        }
      });
    }
    const saveBtn = document.getElementById("save-btn");
    if (saveBtn) {
      saveBtn.addEventListener("click", () => {
        this.saveBarcode();
      });
    }
    const printBtn = document.getElementById("print-btn");
    if (printBtn) {
      printBtn.addEventListener("click", () => {
        this.printBarcode();
      });
    }
    const backBtn = document.getElementById("back-to-generator-btn");
    if (backBtn) {
      backBtn.addEventListener("click", () => {
        this.showGenerator();
      });
    }
    const showHistoryBtn = document.getElementById("show-history-btn");
    if (showHistoryBtn) {
      showHistoryBtn.addEventListener("click", () => {
        window.location.href = "history.html";
      });
    }
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

  showPreview() {
    document.getElementById("step-1")?.classList.add("hidden");
    document.getElementById("step-2")?.classList.remove("hidden");
  }

  showGenerator() {
    document.getElementById("step-2")?.classList.add("hidden");
    document.getElementById("step-1")?.classList.remove("hidden");
  }

  printBarcode() {
    if (!this.currentBarcode) return;
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
                  <div class="barcode-value">${this.currentBarcode.value}</div>
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
  }

  saveBarcode() {
    if (!this.currentBarcode) return;
    const canvas = document.getElementById("barcode-canvas");
    const link = document.createElement("a");
    link.download = `barcode-${this.currentBarcode.value}.png`;
    link.href = canvas.toDataURL();
    link.click();
  }
}

window.addEventListener("DOMContentLoaded", () => {
  window.app = new BarcodeGenerator();
});
