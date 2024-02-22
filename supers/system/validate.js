
export const parseToPositiveNumber = v => {
  let t= Math.abs(parseInt(v));
  return isNaN(t) ? 0 : t;
}

export const parseToPositiveOrNegativeNumber = v => {
  let t= parseInt(v);
  return isNaN(t) ? 0 : t;
}
