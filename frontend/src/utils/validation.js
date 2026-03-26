const RATIONAL_PATTERN = /^-?\d+(\/\d+)?$/;

export const isRational = (value) => {
  const text = String(value ?? "").trim();
  if (!RATIONAL_PATTERN.test(text)) {
    return false;
  }

  if (text.includes("/")) {
    const denominator = Number(text.split("/")[1]);
    return denominator !== 0;
  }

  return true;
};

export const normalizeRational = (value) => String(value ?? "").trim();
