let _colors = [
  '#CCCCCC',
  '#B3B3B3',
  '#4D4D4D',
  '#333333',
  '#85B2E8',
  '#337FB2',
  '#A3CE73',
  '#4B9441',
  '#E9DB2F',
  '#FBB03B',
  '#F15A24',
  '#BE1C21',
  '#7D4837',
  '#90746C',
  '#F08DCA',
  '#6A27A4',
]


/**
 * str2color - converts strange color names like '11-orange-red' to actual color strings, e.g. '#efdea4'.
 *
 * If the string starts with '#', it is left as is
 *
 * @param  {string} col color as index + human readable string
 * @return {string} color as hex color code
 */
export function str2color(col: string): string {
  if (col.startsWith("#"))
    return col;
  try {
    let idx: number = +col.slice(0,2) - 1
    return _colors[idx]
  } catch(any) {
    return undefined
  }
}
