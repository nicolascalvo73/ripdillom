/** cubic-bezier(x1,y1,x2,y2) como en CSS: devuelve y para un x (tiempo) en [0,1]. */
export function bezier(x1: number, y1: number, x2: number, y2: number) {
  const cx = 3 * x1
  const bx = 3 * (x2 - x1) - cx
  const ax = 1 - cx - bx
  const cy = 3 * y1
  const by = 3 * (y2 - y1) - cy
  const ay = 1 - cy - by
  const X = (t: number) => ((ax * t + bx) * t + cx) * t
  const Y = (t: number) => ((ay * t + by) * t + cy) * t
  return (x: number) => {
    if (x <= 0) return 0
    if (x >= 1) return 1
    let lo = 0
    let hi = 1
    let t = x
    for (let i = 0; i < 20; i++) {
      const d = X(t) - x
      if (Math.abs(d) < 1e-5) break
      if (d > 0) hi = t
      else lo = t
      t = (lo + hi) / 2
    }
    return Y(t)
  }
}
