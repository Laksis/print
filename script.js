let selectedProduct = null; // ✅ Nodrošina, ka šis mainīgais eksistē globāli
let selectedModel = null;


const canvasSizes = {
    "Soft Case": { width: 90, height: 180 },
    "Soft Case MagSafe": { width: 90, height: 190 }
};



// ✅ Produktu un modeļu atbilstība
const productModels = {
    "Soft Case": {
        "iPhone 16": "Soft_Case/iPhone_16.svg",
        "iPhone 16 Pro": "Soft_Case/iPhone_16_Pro.svg"
    },
    "Soft Case MagSafe": {
        "Samsung S25": "Soft_Case_MagSafe/Samsung_S25.svg",
        "Samsung S25 Ultra": "Soft_Case_MagSafe/Samsung_S25_Ultra.svg"
    }
};


function mmToPixels(mm) {
    return Math.round(mm * 3.78); // Pārvērš milimetrus pikseļos (1mm ≈ 3.78px)
}


// ✅ Funkcija dropdown atvēršanai un aizvēršanai
function toggleDropdown(id) {
    let dropdown = document.getElementById(id);
    dropdown.style.display = dropdown.style.display === "block" ? "none" : "block";
}

// ✅ Funkcija produkta izvēlei un modeļu dropdown ģenerēšanai
function selectProduct(product) {
    selectedProduct = product;
    document.getElementById("productButton").textContent = product + " ▼";
    document.getElementById("productDropdown").style.display = "none";
    document.getElementById("modelDropdownContainer").style.display = "block";
    document.getElementById("modelButton").textContent = "Select Model ▼";
    document.getElementById("modelDropdown").style.display = "none";
    document.getElementById("uploadSection").style.display = "none";

    let modelList = document.getElementById("modelList");
    modelList.innerHTML = ""; // Notīra iepriekšējos modeļus

    if (!productModels[product]) {
        console.error("❌ Error: Selected product not found in `productModels`!", product);
        return;
    }

    // ✅ Pielāgo `canvas` izmēru atbilstoši produktam
    let canvas = document.getElementById("imageCanvas");
    if (canvasSizes[product]) {
        canvas.width = mmToPixels(canvasSizes[product].width);
        canvas.height = mmToPixels(canvasSizes[product].height);
        console.log(`📏 Canvas resized: ${canvas.width}px x ${canvas.height}px`);
    }

    // ✅ Pievieno modeļus dropdown sarakstam dinamiskā veidā
    Object.keys(productModels[product]).forEach(model => {
        let li = document.createElement("li");
        li.textContent = model;
        li.onclick = function () { 
            selectModel(model); 
        };
        modelList.appendChild(li);
    });

}


// ✅ Modeļa izvēle un SVG attēlošana
function selectModel(model) {
    console.log("🔎 Debugging - model received:", model);
    
    if (typeof model === "undefined" || model === null) {
        console.error("❌ Error: `model` is undefined or null at function call!");
        return;
    }

    // ✅ Saglabā izvēlēto modeli globālajā mainīgajā
    selectedModel = model;

    console.log("✔ Selected Model:", model);
    document.getElementById("modelButton").textContent = model + " ▼";
    document.getElementById("modelDropdown").style.display = "none";
    document.getElementById("uploadSection").style.display = "block";

    if (!selectedProduct) {
        console.error("❌ Error: `selectedProduct` is undefined!");
        return;
    }

    if (!productModels[selectedProduct]) {
        console.error("❌ Error: Selected product not found in `productModels`!", selectedProduct);
        return;
    }

    if (!productModels[selectedProduct][model]) {
        console.error("❌ Error: Selected model not found in `productModels`!", model);
        return;
    }

    // ✅ Pareizā vieta, kur izmantot `model`
    let svgPath = `products/${productModels[selectedProduct][model]}`;

    loadSvgToCanvas(svgPath); // ✅ Pareizi ielādē SVG kanvā
}


// ✅ Ielādē un attēlo SVG failu HTML iekšpusē
function loadSvgToCanvas(svgPath) {
    console.log("Fetching SVG file from:", svgPath); // Debug logs

    fetch(svgPath)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.text();
        })
        .then(svgContent => {
            let parser = new DOMParser();
            let svgDoc = parser.parseFromString(svgContent, "image/svg+xml");
            let svgElement = svgDoc.documentElement;

            let serializer = new XMLSerializer();
            let updatedSvg = serializer.serializeToString(svgElement);
            let blob = new Blob([updatedSvg], { type: "image/svg+xml" });
            let url = URL.createObjectURL(blob);

            let maskImg = new Image();
            maskImg.onload = function () {
                let canvas = document.getElementById("imageCanvas");
                
                // ✅ Piešķir "willReadFrequently: true" konteksta opciju
                let ctx = canvas.getContext("2d", { willReadFrequently: true });

                // ✅ 1. Saglabā attēlu pirms maskas
                let imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);

                // ✅ 2. Uzliek masku, lai atstātu tikai SVG iekšpusi
                ctx.globalCompositeOperation = "destination-in";
                ctx.drawImage(maskImg, 0, 0, canvas.width, canvas.height);

                // ✅ 3. Atjauno normālu zīmēšanu
                ctx.globalCompositeOperation = "source-over";

                console.log("✅ Transparent mask applied!");

                URL.revokeObjectURL(url);
            };
            maskImg.src = url;
        })
        .catch(error => console.error("❌ Error loading SVG:", error));
}




// ✅ Filtrēšanas funkcija dropdown sarakstiem
function filterOptions(inputId, listId) {
    let input = document.getElementById(inputId);
    let filter = input.value.toUpperCase();
    let listItems = document.querySelectorAll(`#${listId} li`);

    listItems.forEach(item => {
        let text = item.textContent || item.innerText;
        item.style.display = text.toUpperCase().includes(filter) ? "" : "none";
    });
}

// ✅ Aizver dropdown, ja klikšķis ir ārpus tā
document.addEventListener("click", function (event) {
    if (!event.target.closest(".dropdown")) {
        document.getElementById("productDropdown").style.display = "none";
        document.getElementById("modelDropdown").style.display = "none";
    }
});

// ✅ Augšupielādētā attēla attēlošana kanvā
document.getElementById("imageUpload").addEventListener("change", function(event) {
    let file = event.target.files[0];
    if (file && (file.type === "image/jpeg" || file.type === "image/png")) {
        let reader = new FileReader();
        reader.onload = function(e) {
            let img = new Image();
            img.onload = function() {
                let canvas = document.getElementById("imageCanvas");
                let ctx = canvas.getContext("2d");

                let canvasWidth = canvas.width;
                let canvasHeight = canvas.height;

                let scaleX = canvasWidth / img.width;
                let scaleY = canvasHeight / img.height;
                let scale = Math.max(scaleX, scaleY); // ✅ Saglabā attēla pareizo mērogu

                let imgWidth = img.width * scale;
                let imgHeight = img.height * scale;
                let offsetX = (canvasWidth - imgWidth) / 2;
                let offsetY = (canvasHeight - imgHeight) / 2;

                // ✅ 1. Notīra `canvas` un vispirms zīmē attēlu
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, offsetX, offsetY, imgWidth, imgHeight);

                console.log("✅ Image successfully drawn inside transparent mask!");

                // ✅ 2. Uzliek masku virs attēla
                if (selectedProduct && selectedModel) {
                    let svgPath = `products/${productModels[selectedProduct][selectedModel]}`;
                    loadSvgToCanvas(svgPath);
                }
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
});

document.addEventListener("DOMContentLoaded", function () {
    selectProduct("Soft Case"); // ✅ Automātiski iestata Soft Case pēc noklusējuma
});
