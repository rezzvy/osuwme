export default (controller) => {
  const model = controller.model;

  model.parseImagemap = async (bbcode) => {
    const imagemapRegex = /\[imagemap\](.+?)\[\/imagemap\]/s;
    const match = bbcode.match(imagemapRegex);

    if (!match) {
      return { status: false, message: `Invalid BBCode syntax` };
    }

    const content = match[1].trim();
    const lines = content
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line);

    const imageUrl = lines.shift();
    const areas = [];

    for (const line of lines) {
      const areaRegex = /^([\d.]+)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)\s+(\S+)(?:\s+(.+))?$/;
      const areaMatch = line.match(areaRegex);

      if (!areaMatch) {
        return { status: false, message: `Invalid area format on: "${line}"` };
      }

      const [, x, y, width, height, href, alt] = areaMatch;

      areas.push({
        x: parseFloat(x),
        y: parseFloat(y),
        width: parseFloat(width),
        height: parseFloat(height),
        href,
        alt: alt || "",
      });
    }

    if (areas.length === 0) return { status: false, message: `No image map item found!` };

    const isImageFetchable = await new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = imageUrl;
    });

    return { status: true, image: { url: imageUrl, isAvailable: isImageFetchable }, items: areas };
  };
};
