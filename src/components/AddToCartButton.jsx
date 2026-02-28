import { IonButton, IonIcon, useIonToast } from "@ionic/react";
import { bagAddOutline } from "ionicons/icons";
import { addToCart } from "../store/CartStore";
import { useI18n } from '../i18n';

export const AddToCartButton = ({ product, size }) => {
	const { t } = useI18n();
	const [present, dismiss] = useIonToast();

	const handleAddToCart = () => {
		addToCart({ ...product, size: size || product.size }, 1);

		// Dispatch event to trigger cart badge pulse animation
		window.dispatchEvent(new CustomEvent('cart-item-added'));

		present({
			message: t('cart.addedToBag') || 'تم الإضافة إلى السلة',
			duration: 3500,
			position: 'top',
			color: 'success',
			buttons: [
				{
					text: t('cart.viewBag') || 'View Bag',
					side: 'end',
					handler: () => {
						dismiss();
						window.dispatchEvent(new CustomEvent('open-cart'));
					},
				},
			],
		});
	};

	return (
		<IonButton
			expand="block"
			onClick={handleAddToCart}
			style={{
				'--background': '#C9A96E',
				'--color': '#0C0C0C',
				'--border-radius': '2px',
				'--box-shadow': 'none',
				fontWeight: 600,
				letterSpacing: '0.12em',
				textTransform: 'uppercase',
				fontSize: '0.75rem',
				fontFamily: "'Jost', sans-serif",
			}}
		>
			<IonIcon icon={bagAddOutline} slot="start" />
			{t('actions.addToBag')}
		</IonButton>
	);
}