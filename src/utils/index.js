export const capitalize = s => s && (s[0].toUpperCase() + s.slice(1)).replaceAll("_", " ");

export const FALLBACK_IMG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='500'%3E%3Cdefs%3E%3ClinearGradient id='bg' x1='0' y1='0' x2='0' y2='1'%3E%3Cstop offset='0' stop-color='%23151515'/%3E%3Cstop offset='1' stop-color='%231C140A'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='400' height='500' fill='url(%23bg)'/%3E%3Ctext x='200' y='270' fill='%23C9A96E' font-size='64' text-anchor='middle' font-family='Georgia%2C serif' opacity='0.4'%3E%E2%9C%A6%3C/text%3E%3C/svg%3E";

export const productInfo = {

	women: {
		tagline: "For Her",
		// Fallback filter tags shown when the API returns no tags for this category
		filters: ["None", "Floral", "Oud", "Oriental", "Fresh"],
		searchPlaceholder: "fragrances",
	},

	men: {
		tagline: "For Him",
		filters: ["None", "Woody", "Oud", "Fresh", "Citrus"],
		searchPlaceholder: "fragrances",
	},

	offers: {
		tagline: "Offers",
		filters: ["None", "Floral", "Oud", "Luxury", "Fresh"],
		searchPlaceholder: "fragrances",
	},

};

export const productSpecs = {

	details: {

		header: "Fragrance Notes",
		options: [
			{
				label: "Top Notes",
				value: "Bergamot, Pink Pepper"
			},
			{
				label: "Heart Notes",
				value: "Rose, Jasmine, Oud"
			},
			{
				label: "Base Notes",
				value: "Sandalwood, Musk, Amber"
			}
		]
	},
	shipping: {

		header: "Shipping",
		options: [
			{
				label: "Standard",
				value: "3–5 business days"
			},
			{
				label: "Express",
				value: "1–2 business days"
			},
			{
				label: "International",
				value: "7–14 business days"
			}
		]
	},
	sizes: {

		header: "Available Sizes",
		wrapText: true,
		options: [
			{
				label: "Travel",
				value: "10 ml"
			},
			{
				label: "Standard",
				value: "50 ml"
			},
			{
				label: "Prestige",
				value: "100 ml"
			}
		]
	}
};

export const randomCount = () => {

	const max = 273;
	const min = 23;
	return Math.floor(Math.random() * (max - min) + min).toFixed(0);
}

/**
 * Sort product attributes by sort_order (if available), then by id
 * Returns a new sorted array without mutating the original
 */
export const sortProductAttributes = (product) => {
	const attrs = Array.isArray(product?.attributes) ? product.attributes : [];
	if (attrs.length === 0) return [];
	
	return [...attrs].sort((a, b) => {
		// First sort by sort_order if available
		if (a.sort_order !== undefined && b.sort_order !== undefined) {
			return a.sort_order - b.sort_order;
		}
		// Fallback to id
		if (a.id !== undefined && b.id !== undefined) {
			return a.id - b.id;
		}
		return 0;
	});
};

/**
 * Get the display price for a product card
 * Returns the price of the first attribute (after sorting) or the base price
 */
export const getDisplayPrice = (product) => {
	const sortedAttrs = sortProductAttributes(product);
	
	// If product has attributes, use the first one's price
	if (sortedAttrs.length > 0) {
		const firstAttr = sortedAttrs[0];
		// Prefer formatted_price, fallback to price
		return firstAttr.formatted_price || firstAttr.price || product.price;
	}
	
	// Otherwise use the base product price (with discount applied)
	return product.price;
};

/**
 * Get the original (pre-discount) price for a product card
 * Returns the original price of the first attribute or the base original price
 */
export const getOriginalPrice = (product) => {
	const sortedAttrs = sortProductAttributes(product);
	
	// If product has attributes, use the first one's original price
	if (sortedAttrs.length > 0) {
		const firstAttr = sortedAttrs[0];
		// Only return if there's actually a discount on this attribute
		if (firstAttr.discount > 0) {
			return firstAttr.formatted_original_price || firstAttr.original_price;
		}
		return null;
	}
	
	// For products without attributes, check product discount
	if (product.discount > 0) {
		return product.original_price;
	}
	
	return null;
};

/**
 * Check if a product has an active discount
 * Checks both attribute-level and product-level discounts
 */
export const hasDiscount = (product) => {
	if (!product) return false;
	
	const sortedAttrs = sortProductAttributes(product);
	
	// If product has attributes, check first attribute's discount
	if (sortedAttrs.length > 0) {
		const firstAttr = sortedAttrs[0];
		return firstAttr.discount > 0;
	}
	
	// Otherwise check product's discount
	return product.discount > 0;
};