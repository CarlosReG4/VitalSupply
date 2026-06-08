// src/store/cartStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Precio final que se cobra: el sugerido (vs competencia) con fallback al viejo.
const precioFinal = (producto) =>
  Number(producto.precio_venta_sugerido ?? producto.precio ?? 0);

export const useCartStore = create(
  persist(
    (set, get) => ({
      carrito: [],

      agregarAlCarrito: (producto) => {
        const carritoActual = get().carrito;
        const productoExistente = carritoActual.find(item => item.mi_sku === producto.mi_sku);

        // Cantidad que pidió el usuario (selector del detalle). Mínimo 1.
        const cantidadAAgregar = Math.max(1, Number(producto.cantidad) || 1);

        if (productoExistente) {
          set({
            carrito: carritoActual.map(item =>
              item.mi_sku === producto.mi_sku
                ? { ...item, cantidad: (item.cantidad || 1) + cantidadAAgregar }
                : item
            )
          });
        } else {
          set({
            carrito: [
              ...carritoActual,
              { ...producto, precio: precioFinal(producto), cantidad: cantidadAAgregar }
            ]
          });
        }
      },

      eliminarDelCarrito: (skuId) => {
        set({ carrito: get().carrito.filter(item => item.mi_sku !== skuId) });
      },

      limpiarCarrito: () => set({ carrito: [] }),
    }),
    {
      name: 'carrito-catsen',
    }
  )
);