const gradientBox = document.querySelector(".gradient-box");
const selectMenu = document.querySelector(".select-box select");
const textarea = document.querySelector("textarea");
const refreshBtn = document.querySelector(".refresh");
const copyBtn = document.querySelector(".copy");
const addColorBtn = document.querySelector(".add-color");
const colorInputsContainer = document.querySelector(".color-inputs");

let colorStops = [
  { color: "#8e3dff", position: 0 },
  { color: "#5a00d8", position: 100 }
];

const getRandomColor = () => {
  const randomHex = Math.floor(Math.random() * 0xffffff).toString(16);
  return `#${randomHex.padStart(6, "0")}`;
};

const createColorInputGroup = (color, position, index) => {
  const group = document.createElement("div");
  group.className = "color-input-group";
  group.innerHTML = `
    <input type="color" value="${color}" />
    <input type="range" min="0" max="100" value="${position}" class="position-slider" />
    <span class="position-value">${position}%</span>
    <button type="button" class="remove-color" title="Remove color">
      <i class="ri-close-line"></i>
    </button>
  `;

  const colorInput = group.querySelector('input[type="color"]');
  const positionSlider = group.querySelector('.position-slider');
  const positionValue = group.querySelector('.position-value');
  const removeBtn = group.querySelector('.remove-color');

  // Event listeners
  colorInput.addEventListener('input', (e) => {
    colorStops[index].color = e.target.value;
    generateGradient();
  });

  positionSlider.addEventListener('input', (e) => {
    const value = parseInt(e.target.value);
    colorStops[index].position = value;
    positionValue.textContent = `${value}%`;
    generateGradient();
  });

  removeBtn.addEventListener('click', () => {
    if (colorStops.length > 2) {
      colorStops.splice(index, 1);
      renderColorInputs();
      generateGradient();
    }
  });

  return group;
};

const renderColorInputs = () => {
  colorInputsContainer.innerHTML = '';
  
  colorStops.forEach((stop, index) => {
    const group = createColorInputGroup(stop.color, stop.position, index);
    colorInputsContainer.appendChild(group);
  });

  // Update remove button states
  const removeButtons = colorInputsContainer.querySelectorAll('.remove-color');
  removeButtons.forEach(btn => {
    btn.disabled = colorStops.length <= 2;
  });
};

const addColorStop = () => {
  // Calculate a good position for the new color stop
  const sortedStops = [...colorStops].sort((a, b) => a.position - b.position);
  let newPosition = 50;
  
  // Find the largest gap between existing stops
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

  // Generate a random color that's different from existing ones
  let newColor;
  do {
    newColor = getRandomColor();
  } while (colorStops.some(stop => stop.color === newColor));

  colorStops.push({ color: newColor, position: newPosition });
  renderColorInputs();
  generateGradient();
};

const generateGradient = (randomize = false) => {
  if (randomize) {
    colorStops.forEach(stop => {
      stop.color = getRandomColor();
    });
    renderColorInputs();
  }

  // Sort color stops by position for proper gradient generation
  const sortedStops = [...colorStops].sort((a, b) => a.position - b.position);
  
  // Create gradient string
  const colorString = sortedStops
    .map(stop => `${stop.color} ${stop.position}%`)
    .join(', ');
  
  const gradient = `linear-gradient(${selectMenu.value}, ${colorString})`;

  gradientBox.style.background = gradient;
  document.body.style.background = gradient;
  textarea.value = `background: ${gradient};`;
  
  // Force textarea update
  textarea.dispatchEvent(new Event('input'));
};

const copyCode = () => {
  if (!navigator.clipboard) {
    alert("Clipboard API not supported in this browser.");
    return;
  }

  navigator.clipboard.writeText(textarea.value).then(() => {
    const originalText = copyBtn.innerHTML;
    copyBtn.innerHTML = '<i class="ri-check-line"></i> Copied!';
    copyBtn.classList.add('copied');
    
    setTimeout(() => {
      copyBtn.innerHTML = originalText;
      copyBtn.classList.remove('copied');
    }, 2000);
  });
};

// Event listeners
addColorBtn.addEventListener('click', addColorStop);
selectMenu.addEventListener('change', () => generateGradient());
refreshBtn.addEventListener('click', () => generateGradient(true));
copyBtn.addEventListener('click', copyCode);

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  renderColorInputs();
  generateGradient(false); // Generate initial gradient with default colors
});

// Fallback initialization (in case DOMContentLoaded already fired)
if (document.readyState === 'loading') {
  // DOM is still loading, wait for DOMContentLoaded
} else {
  // DOM is already loaded
  renderColorInputs();
  generateGradient(false);
}
