import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'appLang';

const translations = {
  en: {
    brand: 'Anfas',
    language: 'EN',
    languageToggle: 'AR',
    home: {
      welcome: 'Welcome back',
      best: 'best for',
      headline: 'Discover Your',
      headlineEmphasis: 'Signature Scent',
      featured: 'Featured',
      collections: 'Collections',
      collection: 'Collection',
    },
    featured: {
      bestSeller: 'Best Seller',
      newArrival: 'New Arrival',
      limited: 'Limited',
    },
    categories: {
      women: 'Women',
      men: 'Men',
      offers: 'Offers',
    },
    taglines: {
      women: 'For Her',
      men: 'For Him',
      offers: 'Offers',
    },
    category: {
      notFoundLabel: 'Not found',
      notFoundTitle: 'This collection doesn\'t exist',
      selectCollection: 'Select Collection',
    },
    productType: {
      notFoundLabel: 'Not found',
      notFoundTitle: 'This product type doesn\'t exist',
      noProducts: 'No products found',
    },
    search: {
      placeholder: 'Search {{subject}}...',
      subjects: {
        fragrances: 'fragrances',
        collection: 'collection',
        beauty: 'beauty',
        shirts: 'shirts',
        skincare: 'skincare',
      },
    },
    filter: {
      title: 'Filter by',
    },
    favourites: {
      title: 'Wishlist',
      emptyTitle: 'Your wishlist is empty',
      emptySubtitle: 'Save fragrances you love',
      saved: '{{count}} saved {{itemLabel}}',
      itemSingular: 'fragrance',
      itemPlural: 'fragrances',
    },
    cart: {
      title: 'Your Bag',
      itemsInBag: '{{count}} {{itemLabel}} in your bag',
      itemSingular: 'Item',
      itemPlural: 'Items',
      reviewCheckout: 'Review & Checkout',
      emptyTitle: 'Your bag is empty',
      emptySubtitle: 'Add some fragrances to get started',
      total: 'Total',
      checkout: 'Proceed to Checkout →',
      name: 'Name',
      phone: 'Phone',
      address: 'Address',    
      orderSummary: 'Order Summary',
      items: 'Items',
      fillDetails: 'Please enter your name, phone number, and address before checking out.',
      discount: 'Discount Code',
      discountPlaceholder: 'Enter discount code',
      applyDiscount: 'Apply',
      discountApplied: '✓ Discount applied!',
      discountInvalid: 'Invalid or expired code',
      removing: 'Remove',
      subtotal: 'Subtotal',
      discountAmount: 'Discount',
      finalTotal: 'Total After Discount',
    },
    product: {
      size: 'Select Size',
      about: 'About This Fragrance',
      description:
        'A sophisticated composition of rare ingredients, this fragrance opens with vibrant top notes that gradually reveal a warm, sensual heart. Crafted in the tradition of haute parfumerie, each bottle is a work of art -- an olfactory journey that lingers on the skin for hours.',
      price: 'Price',
      reviews: '{{count}} review{{suffix}}',
    },
    actions: {
      addToBag: 'Add to Bag',
    },
    specs: {
      details: {
        header: 'Fragrance Notes',
        options: [
          { label: 'Top Notes', value: 'Bergamot, Pink Pepper' },
          { label: 'Heart Notes', value: 'Rose, Jasmine, Oud' },
          { label: 'Base Notes', value: 'Sandalwood, Musk, Amber' },
        ],
      },
      shipping: {
        header: 'Shipping',
        options: [
          { label: 'Standard', value: '3-5 business days' },
          { label: 'Express', value: '1-2 business days' },
          { label: 'International', value: '7-14 business days' },
        ],
      },
      sizes: {
        header: 'Available Sizes',
        wrapText: true,
        options: [
          { label: 'Travel', value: '10 ml' },
          { label: 'Standard', value: '50 ml' },
          { label: 'Prestige', value: '100 ml' },
        ],
      },
    },
    filters: {
      None: 'None',
      Floral: 'Floral',
      Perfume: 'Perfume',
      Beauty: 'Beauty',
      Essence: 'Essence',
      Skin: 'Skin',
      Cream: 'Cream',
      Serum: 'Serum',
      Glow: 'Glow',
      Mascara: 'Mascara',
      Lipstick: 'Lipstick',
      Eye: 'Eye',
      Face: 'Face',
      Watch: 'Watch',
      Gold: 'Gold',
      Steel: 'Steel',
      Luxury: 'Luxury',
      Shirt: 'Shirt',
      Slim: 'Slim',
      Formal: 'Formal',
      Cotton: 'Cotton',
      Mist: 'Mist',
      Moisturizer: 'Moisturizer',
      SPF: 'SPF',
      Lip: 'Lip',
    },
  },
  ar: {
    brand: 'أنفاس',
    language: 'AR',
    languageToggle: 'EN',
    home: {
      welcome: 'أهلا بعودتك',
      best: 'أفضل',
      headline: 'اكتشفي',
      headlineEmphasis: 'رائحتك المميزة',
      featured: 'مختارات مميزة',
      collections: 'المجموعات',
      collection: 'مجموعة',
    },
    featured: {
      bestSeller: 'الأكثر مبيعا',
      newArrival: 'وصل حديثا',
      limited: 'إصدار محدود',
    },
    categories: {
      women: 'نساء',
      men: 'رجال',
      offers: 'عروض',
    },
    taglines: {
      women: 'لها',
      men: 'له',
      offers: 'عروض',
    },
    category: {
      notFoundLabel: 'غير موجود',
      notFoundTitle: 'هذه المجموعة غير موجودة',
      selectCollection: 'اختر المجموعة',
    },
    productType: {
      notFoundLabel: 'غير موجود',
      notFoundTitle: 'نوع المنتج غير موجود',
      noProducts: 'لا توجد منتجات',
    },
    search: {
      placeholder: 'ابحث عن {{subject}}...',
      subjects: {
        fragrances: 'العطور',
        collection: 'المجموعة',
        beauty: 'الجمال',
        shirts: 'القمصان',
        skincare: 'العناية بالبشرة',
      },
    },
    filter: {
      title: 'تصفية حسب',
    },
    favourites: {
      title: 'المفضلة',
      emptyTitle: 'قائمة المفضلة فارغة',
      emptySubtitle: 'احفظ العطور التي تحبها',
      saved: '{{count}} {{itemLabel}} محفوظة',
      itemSingular: 'عطر',
      itemPlural: 'عطور',
    },
    cart: {
      title: 'حقيبتك',
      itemsInBag: '{{count}} {{itemLabel}} في الحقيبة',
      itemSingular: 'قطعة',
      itemPlural: 'قطع',
      reviewCheckout: 'مراجعة وانهاء الطلب',
      emptyTitle: 'حقيبتك فارغة',
      emptySubtitle: 'اضف بعض العطور للبدء',
      total: 'الاجمالي',
      checkout: 'انهاء الشراء \u2190',
      name: 'الاسم',
      phone: 'الهاتف',
      address: 'العنوان',
      orderSummary: 'ملخص الطلب',
      items: 'المنتجات',
      fillDetails: 'يرجى إدخال اسمك ورقم الهاتف وعنوانك قبل إنهاء الطلب.',
      discount: 'كود الخصم',
      discountPlaceholder: 'ادخل كود الخصم',
      applyDiscount: 'تطبيق',
      discountApplied: '✓ تم تطبيق الخصم!',
      discountInvalid: 'كود غير صالح أو منتهي الصلاحية',
      removing: 'حذف',
      subtotal: 'الاجمالي قبل الخصم',
      discountAmount: 'الخصم',
      finalTotal: 'الاجمالي بعد الخصم',
    },
    product: {
      size: 'اختر الحجم',
      about: 'حول هذا العطر',
      description:
        'تركيبة راقية من مكونات نادرة، يفتتح هذا العطر بنفحات علوية نابضة ثم يكشف عن قلب دافئ وحسي. صممت كل زجاجة بروح العطور الراقية لتكون رحلة عطرية تدوم على البشرة لساعات.',
      price: 'السعر',
      reviews: '{{count}} مراجعة',
    },
    actions: {
      addToBag: 'اضف الى الحقيبة',
    },
    specs: {
      details: {
        header: 'عن العطر',
        options: [
          { label: 'النوتات العليا', value: 'برغموت، فلفل وردي' },
          { label: 'قلب العطر', value: 'ورد، ياسمين، عود' },
          { label: 'النوتات الاساسية', value: 'خشب الصندل، مسك، عنبر' },
        ],
      },
      shipping: {
        header: 'الشحن',
        options: [
          { label: 'عادي', value: '3-5 ايام عمل' },
          { label: 'سريع', value: '1-2 يوم عمل' },
          { label: 'دولي', value: '7-14 يوم عمل' },
        ],
      },
      sizes: {
        header: 'الاحجام المتاحة',
        wrapText: true,
        options: [
          { label: 'سفر', value: '10 مل' },
          { label: 'قياسي', value: '50 مل' },
          { label: 'فاخر', value: '100 مل' },
        ],
      },
    },
    filters: {
      None: 'بدون',
      Floral: 'زهري',
      Perfume: 'عطر',
      Beauty: 'جمال',
      Essence: 'خلاصة',
      Skin: 'بشرة',
      Cream: 'كريم',
      Serum: 'سيروم',
      Glow: 'اشراقة',
      Mascara: 'مسكرا',
      Lipstick: 'احمر شفاه',
      Eye: 'عين',
      Face: 'وجه',
      Watch: 'ساعة',
      Gold: 'ذهب',
      Steel: 'فولاذ',
      Luxury: 'فاخر',
      Shirt: 'قميص',
      Slim: 'ضيق',
      Formal: 'رسمي',
      Cotton: 'قطن',
      Mist: 'رذاذ',
      Moisturizer: 'مرطب',
      SPF: 'حماية شمس',
      Lip: 'شفاه',
    },
  },
};

const I18nContext = createContext({
  language: 'en',
  setLanguage: () => {},
  toggleLanguage: () => {},
  t: () => '',
});

const getStoredLanguage = () => {
  if (typeof window === 'undefined') return 'en';
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === 'ar' || stored === 'en') return stored;
  const browserLang = window.navigator.language || '';
  return browserLang.toLowerCase().startsWith('ar') ? 'ar' : 'en';
};

const getValue = (obj, path) => {
  if (!obj) return undefined;
  return path.split('.').reduce((acc, key) => (acc ? acc[key] : undefined), obj);
};

const formatText = (text, vars) => {
  if (!vars) return text;
  return text.replace(/\{\{(\w+)\}\}/g, (_, key) => (vars[key] !== undefined ? String(vars[key]) : ''));
};

export const I18nProvider = ({ children }) => {
  const [language, setLanguage] = useState(getStoredLanguage());

  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, language);
    }
  }, [language]);

  const toggleLanguage = () => setLanguage((prev) => (prev === 'en' ? 'ar' : 'en'));

  const t = (key, vars, fallback) => {
    const template = getValue(translations[language], key) ?? getValue(translations.en, key) ?? fallback ?? key;
    if (typeof template !== 'string') return template;
    return formatText(template, vars);
  };

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      toggleLanguage,
      t,
      translations: translations[language],
    }),
    [language]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const useI18n = () => useContext(I18nContext);

export const getSpecsByLanguage = (language) => translations[language]?.specs || translations.en.specs;
