export const fractionToLatex = (value) => {
  const text = String(value ?? "").trim();
  if (!text) {
    return "0";
  }

  const parts = text.split("/");
  if (parts.length !== 2) {
    return text;
  }

  const numerator = Number(parts[0]);
  const denominator = Number(parts[1]);

  if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator === 0) {
    return text;
  }

  const sign = numerator * denominator < 0 ? "-" : "";
  return `${sign}\\frac{${Math.abs(numerator)}}{${Math.abs(denominator)}}`;
};

export const variableToLatex = (name) => {
  const match = String(name ?? "").match(/^([a-zA-Z]+)(\d+)$/);
  if (!match) {
    return String(name ?? "");
  }
  return `${match[1]}_{${match[2]}}`;
};
