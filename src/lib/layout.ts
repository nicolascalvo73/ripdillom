/** Panel lateral (desktop, tablet y celu horizontal) o bottom sheet (celu vertical). */
export const esLateral = () => window.innerWidth >= 768 || window.innerWidth > window.innerHeight

/** Tatuador en escritorio: herramientas a la izquierda y paleta a la derecha. Si no, versión celu (barra inferior). */
export const esTatuadorAncho = () => window.matchMedia('(min-width: 1024px) and (min-height: 560px)').matches
