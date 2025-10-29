const gradientBox = document.getElementById("preview");
const selectMenu = document.getElementById("direction");
const codeInput = document.getElementById("code");
const refreshBtn = document.getElementById("random-btn");
const copyBtn = document.getElementById("copy-btn");
const addColorBtn = document.getElementById("add-color-stop");
const colorStopsContainer = document.getElementById("color-stops");
const colorFormatSelect = document.getElementById("color-format");

let colorStops = [
  { color: "#8e3dff", position: 0 },
  { color: "#5a00d8", position: 100 },
];

const getRandomColor = () => {
  const randomHex = Math.floor(Math.random() * 0xffffff).toString(16);
  return `#${randomHex.padStart(6, "0")}`;
};

function isValidHexColor(color) {
  if (!color) return false;
  return /^#([0-9A-Fa-f]{3}){1,2}$/.test(color);
}

const handleColorInput = (e, index) => {
  const input = e.target;
  let value = input.value.trim();

  if (value && !value.startsWith("#")) {
    value = "#" + value;
    input.value = value;
  }

  if (isValidHexColor(value)) {
    input.style.borderColor = "";
    colorStops[index].color = value;
    generateGradient();
  } else {
    input.style.borderColor = "red";
  }
};

const createColorInputGroup = (color, position, index) => {
  const group = document.createElement("div");
  group.className = "color-stop";
  group.innerHTML = `
    <input type="text" value="${color}" placeholder="#000000" maxlength="7" />
    <input type="range" min="0" max="100" value="${position}" class="position-slider" />
    <span class="position-value">${position}%</span>
    <button type="button" class="btn-outline remove-color" title="Remove Color">
      <i class="ri-delete-bin-5-line"></i>
    </button>
  `;

  const colorInput = group.querySelector('input[type="text"]');
  const positionSlider = group.querySelector(".position-slider");
  const positionValue = group.querySelector(".position-value");
  const removeBtn = group.querySelector(".remove-color");

  colorInput.addEventListener("input", (e) => handleColorInput(e, index));

  colorInput.addEventListener("blur", (e) => {
    const value = e.target.value.trim();
    if (!isValidHexColor(value)) {
      e.target.value = colorStops[index].color;
      e.target.style.borderColor = "";
    }
  });

  positionSlider.addEventListener("input", (e) => {
    const value = parseInt(e.target.value);
    colorStops[index].position = value;
    positionValue.textContent = `${value}%`;
    generateGradient();
  });

  removeBtn.addEventListener("click", () => {
    if (colorStops.length > 2) {
      colorStops.splice(index, 1);
      renderColorInputs();
      generateGradient();
    }
  });

  return group;
};

const renderColorInputs = () => {
  colorStopsContainer.innerHTML = "";

  colorStops.forEach((stop, index) => {
    const group = createColorInputGroup(stop.color, stop.position, index);
    colorStopsContainer.appendChild(group);
  });

  const removeButtons = colorStopsContainer.querySelectorAll(".remove-color");
  removeButtons.forEach((btn) => {
    btn.disabled = colorStops.length <= 2;
    if (colorStops.length <= 2) {
      btn.style.opacity = "0.5";
      btn.style.cursor = "not-allowed";
    } else {
      btn.style.opacity = "1";
      btn.style.cursor = "pointer";
    }
  });
};

const addColorStop = () => {
  const sortedStops = [...colorStops].sort((a, b) => a.position - b.position);
  let newPosition = 50;

  let largestGap = 0;
  let gapPosition = 50;

  for (let i = 0; i < sortedStops.length - 1; i++) {
    const gap = sortedStops[i + 1].position - sortedStops[i].position;
    if (gap > largestGap) {
      largestGap = gap;
      gapPosition = sortedStops[i].position + gap / 2;
    }
  }

  if (largestGap > 10) {
    newPosition = Math.round(gapPosition);
  }

  let newColor;
  do {
    newColor = getRandomColor();
  } while (colorStops.some((stop) => stop.color === newColor));

  colorStops.push({ color: newColor, position: newPosition });
  renderColorInputs();
  generateGradient();
};

const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
};

const hexToHsl = (hex) => {
  const rgb = hexToRgb(hex);
  if (!rgb) return null;

  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h,
    s,
    l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
};

const formatColor = (hex) => {
  const format = colorFormatSelect.value;

  switch (format) {
    case "rgb":
      const rgb = hexToRgb(hex);
      return rgb ? `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` : hex;
    case "hsl":
      const hsl = hexToHsl(hex);
      return hsl ? `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)` : hex;
    default:
      return hex;
  }
};

const generateGradient = (randomize = false) => {
  if (randomize) {
    colorStops.forEach((stop) => {
      stop.color = getRandomColor();
    });
    renderColorInputs();
  }

  const sortedStops = [...colorStops].sort((a, b) => a.position - b.position);

  const colorString = sortedStops
    .map((stop) => `${stop.color} ${stop.position}%`)
    .join(", ");

  const gradient = `linear-gradient(${selectMenu.value}, ${colorString})`;

  gradientBox.style.background = gradient;
  document.querySelector("main").style.background = gradient;

  const formattedColorString = sortedStops
    .map((stop) => `${formatColor(stop.color)} ${stop.position}%`)
    .join(", ");

  const formattedGradient = `linear-gradient(${selectMenu.value}, ${formattedColorString})`;
  const output = `background: ${formattedGradient};`;

  codeInput.value = output;
};

const copyCode = () => {
  if (!navigator.clipboard) {
    alert("Clipboard API not supported in this browser.");
    return;
  }

  navigator.clipboard.writeText(codeInput.value).then(() => {
    const originalText = copyBtn.innerHTML;
    copyBtn.innerHTML = '<i class="ri-check-line"></i> Copied!';
    copyBtn.classList.add("copied");

    setTimeout(() => {
      copyBtn.innerHTML = originalText;
      copyBtn.classList.remove("copied");
    }, 2000);
  });
};

addColorBtn.addEventListener("click", addColorStop);
selectMenu.addEventListener("change", () => generateGradient());
refreshBtn.addEventListener("click", () => generateGradient(true));
copyBtn.addEventListener("click", copyCode);
colorFormatSelect.addEventListener("change", () => generateGradient());

document.addEventListener("DOMContentLoaded", () => {
  renderColorInputs();
  generateGradient(false);
});

if (document.readyState !== "loading") {
  renderColorInputs();
  generateGradient(false);
}
