// import React, { createContext, useContext, useEffect, useMemo, useReducer } from "react";

// const CartContext = createContext(null);

// const cartReducer = (state, action) => {
//   switch (action.type) {
//     case "ADD_TO_CART": {
//       const nextItems = [...state.items];
//       const idx = nextItems.findIndex((i) => i.prd_id === action.payload.prd_id);
//       const stock = Number(action.payload?.qty ?? action.payload?.stock ?? 0);

//       const clamp = (qty) => {
//         const q = Number(qty ?? 0);
//         if (stock > 0) return Math.max(1, Math.min(stock, q));
//         return Math.max(1, q);
//       };

//       if (idx >= 0) {
//         const nextQty = nextItems[idx].quantity + action.payload.quantity;
//         nextItems[idx] = { ...nextItems[idx], quantity: clamp(nextQty) };
//         return { ...state, items: nextItems };
//       }

//       return {
//         ...state,
//         items: [...state.items, { ...action.payload, quantity: clamp(action.payload.quantity) }]
//       };
//     }
//     case "REMOVE_FROM_CART":
//       return { ...state, items: state.items.filter((i) => i.prd_id !== action.payload) };

//     case "UPDATE_QUANTITY":
//       return {
//         ...state,
//         items: state.items.map((i) =>
//           i.prd_id === action.payload.prd_id ? { ...i, quantity: action.payload.quantity } : i
//         )
//       };

//     case "CLEAR_CART":
//       return { ...state, items: [] };

//     default:
//       return state;
//   }
// };

// function safeParseCart(raw) {
//   try {
//     return raw ? JSON.parse(raw) : { items: [] };
//   } catch {
//     return { items: [] };
//   }
// }

// export function CartProvider({ children }) {
//   const [state, dispatch] = useReducer(cartReducer, { items: [] }, () => {
//     if (typeof window === "undefined") return { items: [] };
//     return safeParseCart(localStorage.getItem("cart"));
//   });

//   useEffect(() => {
//     localStorage.setItem("cart", JSON.stringify(state));
//   }, [state]);

//   const addToCart = (product, quantity = 1) => {
//     dispatch({
//       type: "ADD_TO_CART",
//       payload: {
//         ...product,
//         quantity
//       }
//     });
//   };

//   const removeFromCart = (prd_id) => dispatch({ type: "REMOVE_FROM_CART", payload: prd_id });

//   const updateQuantity = (prd_id, quantity) =>
//     dispatch({
//       type: "UPDATE_QUANTITY",
//       payload: { prd_id, quantity }
//     });

//   const clearCart = () => dispatch({ type: "CLEAR_CART" });

//   const getCartCount = () => state.items.reduce((sum, i) => sum + i.quantity, 0);
//   const getCartTotal = () =>
//     state.items.reduce((sum, i) => sum + Number(i.unit_cost || 0) * Number(i.quantity || 0), 0);

//   const value = useMemo(
//     () => ({
//       cart: state,
//       addToCart,
//       removeFromCart,
//       updateQuantity,
//       clearCart,
//       getCartTotal,
//       getCartCount
//     }),
//     [state]
//   );

//   return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
// }

// export function useCart() {
//   const ctx = useContext(CartContext);
//   if (!ctx) throw new Error("useCart must be used within CartProvider");
//   return ctx;
// }

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useCallback,
} from "react";

const CartContext = createContext(null);

const cartReducer = (state, action) => {
  switch (action.type) {
    case "ADD_TO_CART": {
      const nextItems = [...state.items];
      const idx = nextItems.findIndex(
        (i) => i.prd_id === action.payload.prd_id,
      );
      const stock = Number(action.payload?.qty ?? action.payload?.stock ?? 0);

      const clamp = (qty) => {
        const q = Number(qty ?? 0);
        if (stock > 0) return Math.max(1, Math.min(stock, q));
        return Math.max(1, q);
      };

      if (idx >= 0) {
        const nextQty = nextItems[idx].quantity + action.payload.quantity;
        nextItems[idx] = { ...nextItems[idx], quantity: clamp(nextQty) };
        return { ...state, items: nextItems };
      }

      return {
        ...state,
        items: [
          ...state.items,
          { ...action.payload, quantity: clamp(action.payload.quantity) },
        ],
      };
    }
    case "REMOVE_FROM_CART":
      return {
        ...state,
        items: state.items.filter((i) => i.prd_id !== action.payload),
      };

    case "UPDATE_QUANTITY":
      return {
        ...state,
        items: state.items.map((i) =>
          i.prd_id === action.payload.prd_id
            ? { ...i, quantity: action.payload.quantity }
            : i,
        ),
      };

    case "CLEAR_CART":
      return { ...state, items: [] };

    default:
      return state;
  }
};

function safeParseCart(raw) {
  try {
    return raw ? JSON.parse(raw) : { items: [] };
  } catch {
    return { items: [] };
  }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] }, () => {
    if (typeof window === "undefined") return { items: [] };
    return safeParseCart(localStorage.getItem("cart"));
  });

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(state));
  }, [state]);

  const addToCart = (product, quantity = 1) => {
    dispatch({
      type: "ADD_TO_CART",
      payload: {
        ...product,
        quantity,
      },
    });
  };

  const removeFromCart = (prd_id) =>
    dispatch({ type: "REMOVE_FROM_CART", payload: prd_id });

  const updateQuantity = (prd_id, quantity) =>
    dispatch({
      type: "UPDATE_QUANTITY",
      payload: { prd_id, quantity },
    });

  const clearCart = useCallback(() => {
    dispatch({ type: "CLEAR_CART" });
    // Also clear localStorage directly to be safe
    if (typeof window !== "undefined") {
      localStorage.removeItem("cart");
      localStorage.removeItem("cartItems");
    }
    console.log("Cart cleared successfully");
  }, []);

  const getCartCount = useCallback(
    () => state.items.reduce((sum, i) => sum + i.quantity, 0),
    [state.items],
  );

  const getCartTotal = useCallback(
    () =>
      state.items.reduce(
        (sum, i) => sum + Number(i.unit_cost || 0) * Number(i.quantity || 0),
        0,
      ),
    [state.items],
  );

  const value = useMemo(
    () => ({
      cart: state,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getCartTotal,
      getCartCount,
    }),
    [state, clearCart, getCartTotal, getCartCount],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
