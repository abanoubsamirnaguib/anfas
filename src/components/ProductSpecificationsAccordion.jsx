import { IonAccordion, IonAccordionGroup, IonItem, IonLabel, IonList } from "@ionic/react";
import { useRef, useMemo } from "react";
import { productSpecs } from "../utils";
import { getSpecsByLanguage, useI18n } from '../i18n';

/**
 * Build specs from a product's real backend data, falling back to static productSpecs
 * when individual fields are missing.
 *
 * product.fragrance_notes  → object { top, heart, base } OR array [{ label, value }]
 * product.attributes       → array [{name, value, price, formatted_price}]
 * product.shipping_info    → object or array of {label, value}
 */
function buildProductSpecs(product, staticSpecs) {
  const result = {};

  // ── Fragrance Notes ──────────────────────────────────────────────────────────
  const fn = product?.fragrance_notes;
  if (fn && typeof fn === 'object') {
    if (Array.isArray(fn) && fn.length > 0) {
      // Array format: [{ label, value }]
      result.details = { header: staticSpecs.details?.header || 'Fragrance Notes', options: fn };
    } else if (!Array.isArray(fn)) {
      // Object format: use ALL keys from the backend dynamically
      const opts = Object.entries(fn)
        .filter(([, v]) => v)
        .map(([k, v]) => ({ label: k, value: v }));
      if (opts.length > 0) result.details = { header: staticSpecs.details?.header || 'Fragrance Notes', options: opts };
    }
  }
  if (!result.details) result.details = staticSpecs.details;

  // ── Shipping ─────────────────────────────────────────────────────────────────
  const si = product?.shipping_info;
  if (si && typeof si === 'object') {
    if (Array.isArray(si) && si.length > 0) {
      // Array format: [{ label, value }]
      result.shipping = { header: staticSpecs.shipping?.header || 'Shipping', options: si };
    } else if (!Array.isArray(si)) {
      // Object format: use ALL keys from the backend dynamically
      const opts = Object.entries(si)
        .filter(([, v]) => v)
        .map(([k, v]) => ({ label: k, value: v }));
      if (opts.length > 0) result.shipping = { header: staticSpecs.shipping?.header || 'Shipping', options: opts };
    }
  }
  if (!result.shipping) result.shipping = staticSpecs.shipping;

  // ── Available Sizes (from product attributes) ─────────────────────────────────
  const attrs = Array.isArray(product?.attributes) ? product.attributes : [];
  if (attrs.length > 0) {
    result.sizes = {
      header: staticSpecs.sizes?.header || 'Available Sizes',
      wrapText: true,
      options: attrs.map((a) => ({
        label: a.name,
        value: a.formatted_price ? `${a.value} — ${a.formatted_price}` : a.value,
      })),
    };
  } else {
    // No attributes: provide a single "Base Size" option using the product price
    const baseLabel = staticSpecs.sizes?.options?.[1]?.label || 'Base Size';
    const baseValue = product?.price || (product?.final_price ? `L.E ${Math.round(product.final_price)}` : null);
    result.sizes = {
      header: staticSpecs.sizes?.header || 'Available Sizes',
      wrapText: true,
      options: [{ label: baseLabel, value: baseValue }],
    };
  }

  return result;
}

export const ProductSpecificationsAccordion = ({ type, product }) => {

	const accordionGroupRef = useRef(null);
	const { language } = useI18n();
	const staticSpecs = getSpecsByLanguage(language) || productSpecs;

  // When a real product is passed, derive specs from its data; otherwise use static
  const specs = useMemo(
    () => product ? buildProductSpecs(product, staticSpecs) : staticSpecs,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [product?.id, language]
  );

	return (
		<IonAccordionGroup ref={accordionGroupRef}>
			{Object.keys(specs).map((spec, index) => {

				const {header, options, wrapText = false} = specs[spec];
        if (!header || !options) return null;

				return (

					<IonAccordion key={`accordion_${header}_${index}`} style={{ '--background': '#0C0C0C', '--border-color': '#2A2A2A' }}>
						<IonItem
							slot="header"
							lines="none"
							style={{ '--background': '#151515', '--color': '#F5F0E8', marginBottom: '2px' }}
						>
							<IonLabel style={{ fontFamily: "'Jost', sans-serif", fontSize: '0.7rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#C9A96E' }}>
								{header}
							</IonLabel>
						</IonItem>

						<IonList slot="content" style={{ '--background': '#0C0C0C', border: 'none' }}>
							{options.map((option, index2) => {
								const { label, value } = option;
								return (
									<IonItem
										key={`accordion_${header}_${index2}`}
										lines="none"
										style={{ '--background': '#0C0C0C', '--color': '#F5F0E8', marginBottom: '2px' }}
									>
										<IonLabel style={{ color: '#7A7A7A', fontSize: '0.8rem' }}>
											{label}
										</IonLabel>
										<IonLabel slot="end" className={wrapText ? 'ion-text-wrap' : ''} style={{ color: '#F5F0E8', fontSize: '0.8rem', textAlign: 'right' }}>
											{value}
										</IonLabel>
									</IonItem>
								);
							})}
						</IonList>
					</IonAccordion>
				);
			})}
		</IonAccordionGroup>
	);
}
