// OOP
class BarcodeGenerator {
  constructor() {
    this.currentBarcode = null;
    this.initializeEventListeners();
  }

  initializeEventListeners() {
    const nameInput = document.getElementById("barcode-name-input");
    const generateBtn = document.getElementById("generate-random-btn");
    if (nameInput && generateBtn) {
      nameInput.addEventListener("input", () => {
        generateBtn.disabled = nameInput.value.trim() === "";
      });
    }
    if (generateBtn) {
      generateBtn.addEventListener("click", async () => {
        generateBtn.disabled = true;
        generateBtn.innerHTML = `<span class='inline-block w-5 h-5 mr-2 align-middle rounded-full border-2 border-primary-500 border-t-transparent animate-spin-custom'></span> Generating...`;
        // Custom spinner animation via CSS
        if (!document.getElementById("custom-spinner-style")) {
          const style = document.createElement("style");
          style.id = "custom-spinner-style";
          style.innerHTML = `
            @keyframes spin-custom { to { transform: rotate(360deg); } }
            .animate-spin-custom { animation: spin-custom 0.8s linear infinite; border-width: 2px; border-style: solid; border-radius: 9999px; }
          `;
          document.head.appendChild(style);
        }
        await new Promise((r) => setTimeout(r, 2000));
        const upc = this.generateUPC();
        const name = nameInput.value.trim();
        const labelSize =
          document.getElementById("label-size")?.value || "30mm";
        const copies =
          parseInt(document.getElementById("copies-input")?.value) || 1;
        this.currentBarcode = {
          value: upc,
          type: "UPC",
          labelSize,
          copies,
          name,
        };
        this.generateBarcodeImage();
        // Show name and details in preview
        const nameDisplay = document.getElementById("barcode-name-display");
        if (nameDisplay) nameDisplay.textContent = name;
        const details = document.getElementById("preview-details");
        if (details)
          details.textContent = `Label Size: ${labelSize} • Copies: ${copies}`;
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
                labelSize,
                copies,
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
        generateBtn.disabled = false;
        generateBtn.innerHTML = `Generate Random Barcode`;
      });
    }
    // Label size change in preview
    const labelSizeSelect = document.getElementById("label-size");
    if (labelSizeSelect) {
      labelSizeSelect.addEventListener("change", () => {
        if (this.currentBarcode) {
          this.currentBarcode.labelSize = labelSizeSelect.value;
          const details = document.getElementById("preview-details");
          if (details)
            details.textContent = `Label Size: ${labelSizeSelect.value} • Copies: ${this.currentBarcode.copies}`;
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
