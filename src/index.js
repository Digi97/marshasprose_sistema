import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './App';
import reportWebVitals from './reportWebVitals';

import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import Spanish from "./assets/lang/spanish.json";
import English from "./assets/lang/english.json";

import AppUtil from "./AppUtil/AppUtil";

AppUtil.attachTextInputGuard();
AppUtil.attachNumberInputGuard();


i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: "en",
    debug: true,
    resources: {
      en: English,
      es: Spanish,
    },
    interpolation: { escapeValue: false }, // React already handles XSS
  });



const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <App /> 
);

reportWebVitals();
