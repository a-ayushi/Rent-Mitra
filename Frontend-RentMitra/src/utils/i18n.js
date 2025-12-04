import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  ENGLISH: {
    translation: {
      'Search': 'Search',
      'Login': 'Login',
      'Sign Up': 'Sign Up',
      'SELL': 'SELL',
      'All Categories': 'All Categories',
      'Featured Items': 'Featured Items',
      'No items found for this category.': 'No items found for this category.',
      // Add more as needed
    }
  },
  HINDI: {
    translation: {
      'Search': 'खोजें',
      'Login': 'लॉगिन',
      'Sign Up': 'साइन अप',
      'SELL': 'बेचें',
      'All Categories': 'सभी श्रेणियाँ',
      'Featured Items': 'विशेष आइटम्स',
      'No items found for this category.': 'इस श्रेणी के लिए कोई आइटम नहीं मिला।',
      // Add more as needed
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'ENGLISH',
    fallbackLng: 'ENGLISH',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n; 