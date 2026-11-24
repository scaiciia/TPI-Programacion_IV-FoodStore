import axios from 'axios'

/** Extrae el `detail` de HTTPException y lo convierte en un mensaje de pantalla. */
export function leerMensajeError(
  error: unknown,
  fallback = 'Ocurrió un error inesperado. Intentá nuevamente.',
): string {
  if (axios.isAxiosError<unknown>(error)) {
    const data = error.response?.data
    if (data && typeof data === 'object' && 'detail' in data) {
      const { detail } = data as { detail?: unknown }
      if (typeof detail === 'string' && detail.trim()) return detail
      if (Array.isArray(detail)) {
        const mensajes = detail
          .map((item: unknown) => {
            if (item && typeof item === 'object' && 'msg' in item) {
              const { msg } = item as { msg?: unknown }
              return typeof msg === 'string' ? msg : ''
            }
            return ''
          })
          .filter(Boolean)
        if (mensajes.length > 0) return mensajes.join('. ')
      }
    }
  }
  return fallback
}

/** Parámetros compatibles con la instancia de Axios del proyecto. */
export function paramsDeConsulta(entrada: Record<string, string | number | boolean | null | undefined>) {
  return Object.fromEntries(
    Object.entries(entrada).filter(([, valor]) => valor !== null && valor !== undefined),
  )
}
