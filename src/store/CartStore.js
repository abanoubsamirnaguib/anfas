import { Store } from "pullstate";

const CartStore = new Store({
    cart: []
});

export default CartStore;

const findIndex = (cart, product) => cart.findIndex(i => i && (i.title === product.title) && ((i.size || '') === (product.size || '')));

export const addToCart = (product, qty = 1) => {
    const currentCart = CartStore.getRawState().cart;
    const idx = findIndex(currentCart, product);

    CartStore.update(s => {
        if (idx === -1) {
            s.cart = [ ...s.cart, { ...product, qty } ];
        } else {
            s.cart = currentCart.map((it, i) => i === idx ? { ...it, qty: (it.qty || 1) + qty } : it);
        }
    });
};

export const setItemQty = (product, qty) => {
    const currentCart = CartStore.getRawState().cart;
    const idx = findIndex(currentCart, product);
    if (idx === -1) return;
    CartStore.update(s => {
        if (qty <= 0) {
            s.cart = currentCart.filter((_, i) => i !== idx);
        } else {
            s.cart = currentCart.map((it, i) => i === idx ? { ...it, qty } : it);
        }
    });
};

export const increaseQty = (product, by = 1) => {
    const currentCart = CartStore.getRawState().cart;
    const idx = findIndex(currentCart, product);
    if (idx === -1) return;
    CartStore.update(s => {
        s.cart = currentCart.map((it, i) => i === idx ? { ...it, qty: (it.qty || 1) + by } : it);
    });
};

export const decreaseQty = (product, by = 1) => {
    const currentCart = CartStore.getRawState().cart;
    const idx = findIndex(currentCart, product);
    if (idx === -1) return;
    CartStore.update(s => {
        s.cart = currentCart.map((it, i) => i === idx ? { ...it, qty: Math.max(0, (it.qty || 1) - by) } : it).filter(it => (it.qty || 0) > 0);
    });
};

export const removeFromCart = (product) => {
    const currentCart = CartStore.getRawState().cart;
    const idx = findIndex(currentCart, product);
    if (idx === -1) return;
    CartStore.update(s => {
        s.cart = currentCart.filter((_, i) => i !== idx);
    });
};

export const clearCart = () => {
    CartStore.update(s => {
        s.cart = [];
    });
};