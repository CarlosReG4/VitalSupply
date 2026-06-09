// src/store/cartStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Precio final que se cobra: aseguramos que sea un número válido mayor a 0
const precioFinal = (producto) => {
  const precioSugerido = parseFloat(producto.precio_venta_sugerido);
  return precioSugerido > 0 
    ? precioSugerido 
    : (parseFloat(producto.precio) || 0);
};

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
      
      actualizarCantidad: (skuId, nuevaCantidad) => {
        // Aseguramos que la cantidad nunca baje de 1
        const cantidadValida = Math.max(1, Number(nuevaCantidad) || 1);
        
        set({
          carrito: get().carrito.map(item =>
            item.mi_sku === skuId
              ? { ...item, cantidad: cantidadValida }
              : item
          )
        });
      },

      eliminarDelCarrito: (skuId) => {
        set({ carrito: get().carrito.filter(item => item.mi_sku !== skuId) });
      },

      limpiarCarrito: () => set({ carrito: [] }),
    }),
    {
      name: 'carrito-vitalsupply', // <-- CAMBIADO AQUÍ PARA REFLÉJAR LA IDENTIDAD CORRECTA
    }
  )
);