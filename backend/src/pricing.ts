export const minimumNightlyPrice = 500;

export function isValidNightlyPrice(price: unknown): boolean {
  return (
    typeof price === "number" &&
    Number.isInteger(price) &&
    price >= minimumNightlyPrice
  );
}