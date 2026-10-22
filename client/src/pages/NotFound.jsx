import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../context/LanguageContext';
import Logo from '../components/common/Logo';
import { Home } from 'lucide-react';

const NotFound = () => {
  const { isUrdu } = useTranslation();

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 bg-bakery-50">
      <div className="max-w-md w-full bg-white rounded-xl border border-bakery-200 p-8 text-center shadow-sm space-y-5">
        <div className="flex justify-center mb-2">
          <Logo size={40} variant="dark" to="/" />
        </div>

        <span className="text-5xl font-serif font-extrabold text-caramel block">
          404
        </span>

        <div className="space-y-1.5">
          <h1 className="text-xl sm:text-2xl font-serif font-bold text-chocolate">
            {isUrdu ? 'صفحہ نہیں ملا' : 'Page Not Found'}
          </h1>
          <p className="text-xs sm:text-sm text-bakery-600 leading-relaxed">
            {isUrdu
              ? 'جس صفحے کو آپ تلاش کر رہے ہیں وہ موجود نہیں ہے یا اس کا پتہ تبدیل ہو چکا ہے۔'
              : 'The page you are looking for does not exist, has been removed, or was moved to another URL.'}
          </p>
        </div>

        <div className="pt-2 flex justify-center">
          <Link
            to="/"
            className="btn-primary text-xs py-2.5 px-5 rounded-md font-medium inline-flex items-center gap-2 shadow-xs"
          >
            <Home className="w-3.5 h-3.5" />
            <span>{isUrdu ? 'ہوم پیج پر واپس جائیں' : 'Back to Home'}</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
