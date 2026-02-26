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