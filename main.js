import { KeyGenerator } from "./KeyGenerator.js"; 
import { SDESBase } from "./SDESBase.js";

let allSteps = [];
let currentIdx = 0;

// Verileri son ekranda göstermek için saklayacağımız değişkenler
let savedPT = "";
let savedCT = "";

const nextBtn = document.getElementById("nextBtn");
const prevBtn = document.getElementById("prevBtn");
const startBtn = document.getElementById("start-system-btn");
const entryPage = document.getElementById("entry-page");
const processPage = document.getElementById("process-page");
const stepTitleEl = document.getElementById("step-title");
const stepContentEl = document.getElementById("step-content");
const currNumEl = document.getElementById("curr-num");
const totalNumEl = document.getElementById("total-num");
const endScreen = document.getElementById("end-screen");

const getBitsFromContainer = (containerId) => {
    const inputs = document.querySelectorAll(`#${containerId} input`);
    return Array.from(inputs).map(i => i.value).join("");
};

startBtn.addEventListener("click", () => {
    const pt = getBitsFromContainer("plaintext-input");
    const key = getBitsFromContainer("key-input");

    if (pt.length === 8 && key.length === 10) {
        const kData = KeyGenerator.generateKeys(key);
        const eData = SDESBase.encrypt(pt, kData.keys);

        // Verileri son ekran için burada yedekliyoruz
        savedPT = pt;
        savedCT = eData.result;

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
        alert("Geçerli input değeri giriniz!"); 
    }
});

function render() {
    const step = allSteps[currentIdx];
    if (!step) return;

    currNumEl.textContent = (currentIdx + 1).toString().padStart(2, '0');
    stepTitleEl.textContent = `STEP DETAIL: ${step.title}`;

    let htmlContent = `<p class="step-description">${step.desc || ""}</p>`;

    let imgName = "";
    const t = step.title.toUpperCase();
    if (t.includes("P10")) imgName = "P10_table.png";
    else if (t.includes("P8")) imgName = "P8_table.png";
    else if (t.includes("S-BOX 0") || t.includes("S0")) imgName = "S0_box.png";
    else if (t.includes("S-BOX 1") || t.includes("S1")) imgName = "S1_box.png";
    else if (t.includes("INITIAL PERMUTATION") || t.includes("IP:")) imgName = "IP_table.png";
    else if (t.includes("IP⁻¹") || t.includes("IP-1")) imgName = "IP-1_table.png";
    else if (t.includes("EP")) imgName = "EP_table.png";
    else if (t.includes("P4")) imgName = "P4_table.png";

    if (imgName) {
        htmlContent += `<div class="step-visual-tool"><img src="${imgName}" class="table-img" style="margin-top: 40px;"></div>`;
    }

   if ((t.includes("LS") || t.includes("LEFT SHIFT")) && step.l_prev) {
        htmlContent += `
            <div class="ls-comparison-wrapper">
                <div class="ls-container side-by-side">
                    <div class="ls-box left-box gray-scale">
                        <div class="ls-header">BEFORE L</div>
                        <div class="bit-display">${step.l_prev.split('').map(b => `<span>${b}</span>`).join('')}</div>
                    </div>
                    <div class="ls-box right-box gray-scale">
                        <div class="ls-header">BEFORE R</div>
                        <div class="bit-display">${step.r_prev.split('').map(b => `<span>${b}</span>`).join('')}</div>
                    </div>
                </div>
                <div class="comp-arrow">→</div>
                <div class="ls-container side-by-side">
                    <div class="ls-box left-box">
                        <div class="ls-header">AFTER L</div>
                        <div class="bit-display">${step.l_val.split('').map(b => `<span>${b}</span>`).join('')}</div>
                    </div>
                    <div class="ls-box right-box">
                        <div class="ls-header">AFTER R</div>
                        <div class="bit-display">${step.r_val.split('').map(b => `<span>${b}</span>`).join('')}</div>
                    </div>
                </div>
            </div>`;
    } 
    else if (step.prev && step.val) {
        htmlContent += `
            <div class="comparison-container">
                <div class="comp-box">
                    <span class="comp-label">INPUT</span>
                    <div class="comp-value gray">${step.prev}</div>
                </div>
                <div class="comp-arrow">→</div>
                <div class="comp-box">
                    <span class="comp-label">OUTPUT</span>
                    <div class="comp-value">${step.val}</div>
                </div>
            </div>`;
    } 
    else {
        htmlContent += `<div class="step-value-display">${step.val || ""}</div>`;
    }

    stepContentEl.innerHTML = htmlContent;
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

// Son ekranı tetikleyen fonksiyon
window.showEndScreen = () => {
    document.getElementById("final-pt").textContent = savedPT;
    document.getElementById("final-ct").textContent = savedCT;
    
    processPage.classList.add("hidden");
    endScreen.style.display = "flex"; // style="display:none" kullandığın için flex yapıyoruz
};

nextBtn.onclick = () => {
    if (currentIdx < allSteps.length - 1) {
        currentIdx++;
        render();
    } else {
        window.showEndScreen();
    }
};

prevBtn.onclick = () => {
    if (currentIdx > 0) {
        currentIdx--;
        render();
    }
}

const setupAutoSkip = (containerId) => {
    const inputs = document.querySelectorAll(`#${containerId} input`);
    inputs.forEach((input, index) => {
        input.addEventListener('keypress', (e) => {
            if (e.key !== '0' && e.key !== '1') {
                e.preventDefault();
            }
        });

        input.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/[^01]/g, '');
            if (e.target.value && index < inputs.length - 1) {
                inputs[index + 1].focus();
            }
        });

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace' && !input.value && index > 0) {
                inputs[index - 1].focus();
            }
        });

        input.addEventListener('click', () => input.select());
    });
};

setupAutoSkip("plaintext-input");
setupAutoSkip("key-input");