export default (controller) => {
  const model = controller.model;

  model.rgbToHex = (rgbString) => {
    const match = rgbString.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
    if (!match) return "#FFFFFF";
    return model.rgbToHexRaw(parseInt(match[1]), parseInt(match[2]), parseInt(match[3]));
  };

  model.hexToRgb = (hex) => {
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) } : { r: 0, g: 0, b: 0 };
  };

  model.rgbToHexRaw = (r, g, b) => {
    const toHex = (c) => {
      const hex = Math.round(c).toString(16);
      return hex.length === 1 ? "0" + hex : hex;
    };
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  };

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
    return { r: (r + m) * 255, g: (g + m) * 255, b: (b + m) * 255 };
  };

  const interpolateColor = (color1, color2, factor) => {
    return {
      r: color1.r + (color2.r - color1.r) * factor,
      g: color1.g + (color2.g - color1.g) * factor,
      b: color1.b + (color2.b - color1.b) * factor,
    };
  };

  const isSpace = (char) => /\s/.test(char);

  const countVisibleSegments = (segments) => {
    return segments.filter((s) => !isSpace(s)).length;
  };

  model.getSegments = (text) => {
    const segments = [];

    const isProblematicSequence = (txt, i) => {
      const fourChar = txt.slice(i, i + 4);
      if (fourChar === "<---" || fourChar === "--->") return 4;
      const threeChar = txt.slice(i, i + 3);
      if (threeChar === "<--" || threeChar === "-->") return 3;
      const twoChar = txt.slice(i, i + 2);
      if (twoChar === "<-" || twoChar === "->") return 2;
      return 0;
    };

    const isSurrogatePair = (txt, i) => {
      const code = txt.charCodeAt(i);
      return code >= 0xd800 && code <= 0xdbff;
    };

    for (let i = 0; i < text.length; ) {
      let len = isProblematicSequence(text, i);
      if (len === 0) len = isSurrogatePair(text, i) ? 2 : 1;

      segments.push(text.slice(i, i + len));
      i += len;
    }
    return segments;
  };

  model.generateGradient = (text, colorStart = "#FF0000", colorEnd = "#0000FF") => {
    const segments = model.getSegments(text);
    if (segments.length === 0) return [];

    const visibleCount = countVisibleSegments(segments);
    const startRgb = model.hexToRgb(colorStart);
    const endRgb = model.hexToRgb(colorEnd);
    const colors = [];

    let visibleIndex = 0;

    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];

      if (isSpace(segment)) {
        colors.push("THIS_IS_SPACE");
        continue;
      }

      const factor = visibleCount <= 1 ? 0 : visibleIndex / (visibleCount - 1);
      const c = interpolateColor(startRgb, endRgb, factor);
      colors.push(model.rgbToHexRaw(c.r, c.g, c.b));

      visibleIndex++;
    }
    return colors;
  };

  model.generateMiddleGradient = (text, colorStart = "#FF0000", colorMiddle = "#00FF00", colorEnd = colorStart) => {
    const segments = model.getSegments(text);
    if (segments.length === 0) return [];

    const visibleCount = countVisibleSegments(segments);
    const startRgb = model.hexToRgb(colorStart);
    const midRgb = model.hexToRgb(colorMiddle);
    const endRgb = model.hexToRgb(colorEnd);
    const colors = [];

    let visibleIndex = 0;

    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];

      if (isSpace(segment)) {
        colors.push("THIS_IS_SPACE");
        continue;
      }

      const factor = visibleCount <= 1 ? 0 : visibleIndex / (visibleCount - 1);
      let c;

      if (factor <= 0.5) {
        const localFactor = factor * 2;
        c = interpolateColor(startRgb, midRgb, localFactor);
      } else {
        const localFactor = (factor - 0.5) * 2;
        c = interpolateColor(midRgb, endRgb, localFactor);
      }
      colors.push(model.rgbToHexRaw(c.r, c.g, c.b));
      visibleIndex++;
    }
    return colors;
  };

  model.generateThreeColorGradient = (text, colorStart = "#FF0000", colorMiddle = "#00FF00", colorEnd = "#0000FF") => {
    return model.generateMiddleGradient(text, colorStart, colorMiddle, colorEnd);
  };

  model.generateRainbowColors = (text, lightness = 0.625) => {
    const segments = model.getSegments(text);
    const visibleCount = countVisibleSegments(segments);
    const colors = [];
    let visibleIndex = 0;

    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];

      if (isSpace(segment)) {
        colors.push("THIS_IS_SPACE");
        continue;
      }

      const hue = visibleCount <= 1 ? 0 : (visibleIndex / visibleCount) * 360;
      const rgb = model.hslToRgb(hue, 1, lightness);
      colors.push(model.rgbToHexRaw(rgb.r, rgb.g, rgb.b));
      visibleIndex++;
    }
    return colors;
  };

  model.generateRandomColors = (text) => {
    const segments = model.getSegments(text);
    const colors = [];

    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];

      if (isSpace(segment)) {
        colors.push("THIS_IS_SPACE");
        continue;
      }

      const r = Math.floor(Math.random() * 128) + 128;
      const g = Math.floor(Math.random() * 128) + 128;
      const b = Math.floor(Math.random() * 128) + 128;
      colors.push(model.rgbToHexRaw(r, g, b));
    }
    return colors;
  };
};
