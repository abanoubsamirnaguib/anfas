import { IonCol, IonIcon, IonNote } from "@ionic/react";
import { star } from "ionicons/icons";
import { useEffect, useState } from "react";
import { randomCount } from "../utils";
import { useI18n } from '../i18n';

export const ProductReviews = () => {
	const { t } = useI18n();

	//	This count could come from the product (if real data was fed)
	const [reviewCount, setReviewCount] = useState(0);

	useEffect(() => {

		setReviewCount(randomCount());
	}, []);

	return (
		<IonCol className="ion-text-right">
			<IonIcon color="warning" icon={star} />
			&nbsp;&nbsp;
			<IonNote>
				{t('product.reviews', {
					count: reviewCount,
					suffix: reviewCount > 1 ? 's' : '',
				})}
			</IonNote>
		</IonCol>
	);
}