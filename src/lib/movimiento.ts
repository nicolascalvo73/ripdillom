const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
export const reducirMovimiento = () => mq.matches
