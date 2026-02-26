import { IonButton, IonIcon } from "@ionic/react";
import { bagAddOutline } from "ionicons/icons";
import { addToCart } from "../store/CartStore";
import { useI18n } from '../i18n';

export const AddToCartButton = ({ product, size }) => {
	const { t } = useI18n();

	return (
		<IonButton
			expand="block"
			onClick={() => addToCart({ ...product, size: size || product.size }, 1)}
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