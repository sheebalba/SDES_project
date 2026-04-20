import { KeyGenerator } from "./KeyGenerator.js"; 
import { SDESBase } from "./SDESBase.js";

let allSteps = [];
let currentIdx = 0;

const startBtn = document.getElementById("start-system-btn");
const entryPage = document.getElementById("entry-page");
const processPage = document.getElementById("process-page");
const stepTitleEl = document.getElementById("step-title");
const stepContentEl = document.getElementById("step-content");
const currNumEl = document.getElementById("curr-num");
const totalNumEl = document.getElementById("total-num");

const getBitsFromContainer = (containerId) => {
    const inputs = document.querySelectorAll(`#${containerId} input`);
    return Array.from(inputs).map(i => i.value || "0").join("");
};

startBtn.addEventListener("click", () => {
    const pt = getBitsFromContainer("plaintext-input");
    const key = getBitsFromContainer("key-input");

    if (pt.length === 8 && key.length === 10) {
        const kData = KeyGenerator.generateKeys(key);
        const eData = SDESBase.encrypt(pt, kData.keys);

        allSteps = [...kData.logs, ...eData.logs];
        totalNumEl.textContent = allSteps.length.toString().padStart(2, '0');
        currentIdx = 0;

        startBtn.textContent = "PROCESSING...";
        setTimeout(() => { 
            entryPage.classList.add("hidden"); 
            processPage.classList.remove("hidden"); 
            render(); 
        }, 800);
    } else { 
        alert("HATA: Alanları kontrol edin!"); 
    }
});

function render() {
    const step = allSteps[currentIdx];
    currNumEl.textContent = (currentIdx + 1).toString().padStart(2, '0');
    stepTitleEl.textContent = `STEP DETAIL: ${step.title}`;
    stepContentEl.innerHTML = `
        <p class="step-description">${step.desc}</p>
        <div class="step-value-display">${step.val}</div>
    `;
    updateStepper(step.title);
}

function updateStepper(stepTitle) {
    const upperTitle = stepTitle.toUpperCase();
    document.querySelectorAll(".step-item").forEach(item => {
        item.classList.remove("active");
        if (upperTitle.includes(item.dataset.step)) {
            item.classList.add("active");
        }
    });
}

document.getElementById("nextBtn").addEventListener("click", () => { 
    if (currentIdx < allSteps.length - 1) { currentIdx++; render(); } 
});

document.getElementById("prevBtn").addEventListener("click", () => { 
    if (currentIdx > 0) { currentIdx--; render(); } 
});

// Auto-skip fonksiyonu
const setupAutoSkip = (containerId) => {
    const inputs = document.querySelectorAll(`#${containerId} input`);
    inputs.forEach((input, index) => {
        input.addEventListener('input', (e) => {
            if (e.target.value && index < inputs.length - 1) inputs[index + 1].focus();
        });
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace' && !input.value && index > 0) inputs[index - 1].focus();
        });
        input.addEventListener('click', () => input.select());
    });
};

setupAutoSkip("plaintext-input");
setupAutoSkip("key-input");