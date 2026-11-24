import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CarritoItem {
  producto_id: number
  nombre: string
  precio_unitario: number
  cantidad: number
}

interface CartState {
  items: CarritoItem[]
  agregar: (item: Omit<CarritoItem, 'cantidad'>, cantidad?: number) => void
  quitar: (productoId: number) => void
  cambiarCantidad: (productoId: number, cantidad: number) => void
  vaciar: () => void
  total: () => number
  cantidadTotal: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      agregar: (item, cantidad = 1) =>
        set((state) => {
          const existente = state.items.find((i) => i.producto_id === item.producto_id)
          if (existente) {
            return {
              items: state.items.map((i) =>
                i.producto_id === item.producto_id
                  ? { ...i, cantidad: i.cantidad + cantidad }
                  : i,
              ),
            }
          }
          return { items: [...state.items, { ...item, cantidad }] }
        }),

      quitar: (productoId) =>
        set((state) => ({
          items: state.items.filter((item) => item.producto_id !== productoId),
        })),

      cambiarCantidad: (productoId, cantidad) =>
        set((state) => ({
          items:
            cantidad <= 0
              ? state.items.filter((item) => item.producto_id !== productoId)
              : state.items.map((item) =>
                  item.producto_id === productoId ? { ...item, cantidad } : item,
                ),
        })),

      vaciar: () => set({ items: [] }),

      total: () =>
        get().items.reduce(
          (suma, item) => suma + item.precio_unitario * item.cantidad,
          0,
        ),

      cantidadTotal: () =>
        get().items.reduce((suma, item) => suma + item.cantidad, 0),
    }),
    {
      name: 'foodstore-carrito',
      partialize: (state) => ({ items: state.items }),
    },
  ),
)
