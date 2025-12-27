export default (controller) => {
  const model = controller.model;

  model.hslToRgb = (h, s, l) => {
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = l - c / 2;
    let r, g, b;

    if (h < 60) [r, g, b] = [c, x, 0];
    else if (h < 120) [r, g, b] = [x, c, 0];
    else if (h < 180) [r, g, b] = [0, c, x];
    else if (h < 240) [r, g, b] = [0, x, c];
    else if (h < 300) [r, g, b] = [x, 0, c];
    else [r, g, b] = [c, 0, x];

    return {
      r: Math.round((r + m) * 255),
      g: Math.round((g + m) * 255),
      b: Math.round((b + m) * 255),
    };
  };

  model.rgbToHex = (rgbString) => {
    const isValidRgb = /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/.test(rgbString);
    if (!isValidRgb) return "#FFFFFF";

    const [r, g, b] = rgbString.match(/\d+/g).map(Number);
    return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
  };

  model.hexToRgb = (hex) => {
    return {
      r: parseInt(hex.substring(1, 3), 16),
      g: parseInt(hex.substring(3, 5), 16),
      b: parseInt(hex.substring(5, 7), 16),
    };
  };

  model.generateGradient = (text, colorStart = "#FF0000", colorEnd = "#0000FF") => {
    const colors = [];

    const chars = [...text];
    const textLength = chars.length;

    const colorStartRgb = model.hexToRgb(colorStart);
    const colorEndRgb = model.hexToRgb(colorEnd);

    if (textLength === 0) return [];

    const rinc = (colorEndRgb.r - colorStartRgb.r) / textLength;
    const ginc = (colorEndRgb.g - colorStartRgb.g) / textLength;
    const binc = (colorEndRgb.b - colorStartRgb.b) / textLength;

    for (let i = 0; i < textLength; i++) {
      const r = Math.round(colorStartRgb.r + rinc * i);
      const g = Math.round(colorStartRgb.g + ginc * i);
      const b = Math.round(colorStartRgb.b + binc * i);

      colors.push(model.rgbToHex(`rgb(${r}, ${g}, ${b})`));
    }

    return colors;
  };

  model.generateMiddleGradient = (text, colorStart = "#FF0000", colorMiddle = "#00FF00", colorEnd = colorStart) => {
    const colors = [];

    const chars = [...text];
    const textLength = chars.length;

    if (textLength === 0) return [];

    const midPoint = Math.floor(textLength / 2);

    const colorStartRgb = model.hexToRgb(colorStart);
    const colorMiddleRgb = model.hexToRgb(colorMiddle);
    const colorEndRgb = model.hexToRgb(colorEnd);

    const firstHalfLength = midPoint === 0 ? 1 : midPoint;
    const secondHalfLength = textLength - midPoint === 0 ? 1 : textLength - midPoint;

    const rinc1 = (colorMiddleRgb.r - colorStartRgb.r) / firstHalfLength;
    const ginc1 = (colorMiddleRgb.g - colorStartRgb.g) / firstHalfLength;
    const binc1 = (colorMiddleRgb.b - colorStartRgb.b) / firstHalfLength;

    const rinc2 = (colorEndRgb.r - colorMiddleRgb.r) / secondHalfLength;
    const ginc2 = (colorEndRgb.g - colorMiddleRgb.g) / secondHalfLength;
    const binc2 = (colorEndRgb.b - colorMiddleRgb.b) / secondHalfLength;

    for (let i = 0; i < textLength; i++) {
      let r, g, b;

      if (i < midPoint) {
        r = Math.round(colorStartRgb.r + rinc1 * i);
        g = Math.round(colorStartRgb.g + ginc1 * i);
        b = Math.round(colorStartRgb.b + binc1 * i);
      } else {
        r = Math.round(colorMiddleRgb.r + rinc2 * (i - midPoint));
        g = Math.round(colorMiddleRgb.g + ginc2 * (i - midPoint));
        b = Math.round(colorMiddleRgb.b + binc2 * (i - midPoint));
      }

      colors.push(model.rgbToHex(`rgb(${r}, ${g}, ${b})`));
    }

    return colors;
  };

  model.generateThreeColorGradient = (text, colorStart = "#FF0000", colorMiddle = "#00FF00", colorEnd = "#0000FF") => {
    return model.generateMiddleGradient(text, colorStart, colorMiddle, colorEnd);
  };

  model.generateRainbowColors = (text, lightness = 0.625) => {
    const colors = [];

    const chars = [...text];
    const textLength = chars.length;

    for (let i = 0; i < textLength; i++) {
      const fraction = i / textLength;
      const hue = Math.round(fraction * 360);
      const rgb = model.hslToRgb(hue, 1, lightness);
      colors.push(model.rgbToHex(`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`));
    }

    return colors;
  };

  model.generateRandomColors = (text) => {
    const colors = [];

    const chars = [...text];
    const textLength = chars.length;

    for (let i = 0; i < textLength; i++) {
      const r = Math.floor(Math.random() * 128) + 128;
      const g = Math.floor(Math.random() * 128) + 128;
      const b = Math.floor(Math.random() * 128) + 128;
      colors.push(model.rgbToHex(`rgb(${r}, ${g}, ${b})`));
    }

    return colors;
  };

  model.generateRandomColors = (text) => {
    const colors = [];
    const textLength = text.length;

    for (let i = 0; i < textLength; i++) {
      const r = Math.floor(Math.random() * 128) + 128;
      const g = Math.floor(Math.random() * 128) + 128;
      const b = Math.floor(Math.random() * 128) + 128;
      colors.push(model.rgbToHex(`rgb(${r}, ${g}, ${b})`));
    }

    return colors;
  };
};
