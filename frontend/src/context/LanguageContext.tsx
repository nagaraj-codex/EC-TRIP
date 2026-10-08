import React, { createContext, useContext, useState } from 'react';

export type LanguageCode = 'en' | 'es' | 'fr' | 'de' | 'it' | 'pt' | 'ja' | 'zh' | 'hi';

export interface LanguageInfo {
  code: LanguageCode;
  name: string;
  nativeName: string;
  flag: string;
}

export const LANGUAGES: LanguageInfo[] = [
  { code: 'en', name: 'English (US)', nativeName: 'English (US)', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'French', nativeName: 'Français (France)', flag: '🇫🇷' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português (Brasil)', flag: '🇧🇷' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'zh', name: 'Chinese', nativeName: '中文 (简体)', flag: '🇨🇳' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
];

export const ALL_WORLD_LANGUAGES: { name: string; native: string; code: string }[] = [
  { name: 'English (US)', native: 'English', code: 'en' },
  { name: 'Spanish', native: 'Español', code: 'es' },
  { name: 'French', native: 'Français', code: 'fr' },
  { name: 'German', native: 'Deutsch', code: 'de' },
  { name: 'Italian', native: 'Italiano', code: 'it' },
  { name: 'Portuguese', native: 'Português', code: 'pt' },
  { name: 'Japanese', native: '日本語', code: 'ja' },
  { name: 'Chinese (Simplified)', native: '中文 (简体)', code: 'zh' },
  { name: 'Hindi', native: 'हिन्दी', code: 'hi' },
  { name: 'Arabic', native: 'العربية', code: 'ar' },
  { name: 'Bengali', native: 'বাংলা', code: 'bn' },
  { name: 'Russian', native: 'Русский', code: 'ru' },
  { name: 'Korean', native: '한국어', code: 'ko' },
  { name: 'Dutch', native: 'Nederlands', code: 'nl' },
  { name: 'Turkish', native: 'Türkçe', code: 'tr' },
  { name: 'Polish', native: 'Polski', code: 'pl' },
  { name: 'Swedish', native: 'Svenska', code: 'sv' },
  { name: 'Indonesian', native: 'Bahasa Indonesia', code: 'id' },
  { name: 'Vietnamese', native: 'Tiếng Việt', code: 'vi' },
  { name: 'Greek', native: 'Ελληνικά', code: 'el' },
];

interface Translations {
  quoteLine1: string;
  quoteLine2: string;
  emailPlaceholder: string;
  passwordPlaceholder: string;
  loginButton: string;
  lostPass: string;
  magicPass: string;
  newPass: string;
  createPage: string;
  forCelebrity: string;
  googlePass: string;
  applePass: string;
  privacy: string;
  terms: string;
  cookies: string;
  security: string;
}

const TRANSLATIONS: Record<LanguageCode, Translations> = {
  en: {
    quoteLine1: 'Connect with friends and the world around you on Connectly.',
    quoteLine2: 'Where conversations spark, ideas flow, and communities thrive.',
    emailPlaceholder: 'Email address or phone number',
    passwordPlaceholder: 'Password',
    loginButton: 'Log In',
    lostPass: 'Forgotten password?',
    magicPass: 'Sign in with Magic Link',
    newPass: 'Create new account',
    createPage: 'Create a Page',
    forCelebrity: 'for a celebrity, brand or business.',
    googlePass: 'Continue with Google',
    applePass: 'Sign in with Apple',
    privacy: 'Privacy',
    terms: 'Terms',
    cookies: 'Cookies',
    security: 'Security',
  },
  es: {
    quoteLine1: 'Conéctate con amigos y el mundo que te rodea en Connectly.',
    quoteLine2: 'Donde las conversaciones nacen y las comunidades crecen.',
    emailPlaceholder: 'Correo electrónico o número de teléfono',
    passwordPlaceholder: 'Contraseña',
    loginButton: 'Iniciar sesión',
    lostPass: '¿Olvidaste tu contraseña?',
    magicPass: 'Iniciar con enlace mágico',
    newPass: 'Crear cuenta nueva',
    createPage: 'Crear una página',
    forCelebrity: 'para una celebridad, marca o negocio.',
    googlePass: 'Continuar con Google',
    applePass: 'Iniciar sesión con Apple',
    privacy: 'Privacidad',
    terms: 'Condiciones',
    cookies: 'Cookies',
    security: 'Seguridad',
  },
  fr: {
    quoteLine1: 'Connectez-vous avec vos amis et le monde qui vous entoure sur Connectly.',
    quoteLine2: "Là où naissent les conversations et s'épanouissent les communautés.",
    emailPlaceholder: 'Adresse e-mail ou numéro de mobile',
    passwordPlaceholder: 'Mot de passe',
    loginButton: 'Se connecter',
    lostPass: 'Mot de passe oublié ?',
    magicPass: 'Connexion par lien magique',
    newPass: 'Créer un compte',
    createPage: 'Créer une page',
    forCelebrity: 'pour une célébrité, une marque ou une entreprise.',
    googlePass: 'Continuer avec Google',
    applePass: 'Se connecter avec Apple',
    privacy: 'Confidentialité',
    terms: 'Conditions',
    cookies: 'Cookies',
    security: 'Sécurité',
  },
  de: {
    quoteLine1: 'Verbinde dich mit Freunden und der Welt um dich herum auf Connectly.',
    quoteLine2: 'Wo Gespräche entstehen und Gemeinschaften zusammenwachsen.',
    emailPlaceholder: 'E-Mail-Adresse oder Handynummer',
    passwordPlaceholder: 'Passwort',
    loginButton: 'Anmelden',
    lostPass: 'Passwort vergessen?',
    magicPass: 'Mit Magic-Link anmelden',
    newPass: 'Neues Konto erstellen',
    createPage: 'Seite erstellen',
    forCelebrity: 'für eine Marke, Prominente oder Unternehmen.',
    googlePass: 'Mit Google fortfahren',
    applePass: 'Mit Apple anmelden',
    privacy: 'Datenschutz',
    terms: 'Nutzungsbedingungen',
    cookies: 'Cookies',
    security: 'Sicherheit',
  },
  it: {
    quoteLine1: 'Connettiti con gli amici e il mondo intorno a te su Connectly.',
    quoteLine2: 'Dove le conversazioni nascono e le comunità crescono.',
    emailPlaceholder: 'Indirizzo e-mail o numero di cellulare',
    passwordPlaceholder: 'Password',
    loginButton: 'Accedi',
    lostPass: 'Hai dimenticato la password?',
    magicPass: 'Accedi con link magico',
    newPass: 'Crea nuovo account',
    createPage: 'Crea una pagina',
    forCelebrity: "per un personaggio famoso, un brand o un'azienda.",
    googlePass: 'Continua con Google',
    applePass: 'Accedi con Apple',
    privacy: 'Privacy',
    terms: 'Condizioni',
    cookies: 'Cookie',
    security: 'Sicurezza',
  },
  pt: {
    quoteLine1: 'Conecte-se com amigos e o mundo ao seu redor no Connectly.',
    quoteLine2: 'Onde as conversas ganham vida e comunidades se conectam.',
    emailPlaceholder: 'E-mail ou número de celular',
    passwordPlaceholder: 'Senha',
    loginButton: 'Entrar',
    lostPass: 'Esqueceu a senha?',
    magicPass: 'Entrar com link mágico',
    newPass: 'Criar nova conta',
    createPage: 'Criar uma Página',
    forCelebrity: 'para uma celebridade, marca ou empresa.',
    googlePass: 'Continuar com o Google',
    applePass: 'Entrar com a Apple',
    privacy: 'Privacidade',
    terms: 'Termos',
    cookies: 'Cookies',
    security: 'Segurança',
  },
  ja: {
    quoteLine1: 'Connectlyで友達や世界中の人々とつながりましょう。',
    quoteLine2: '日々の出来事をシェアし、大切な人たちと交流しましょう。',
    emailPlaceholder: 'メールアドレスまたは電話番号',
    passwordPlaceholder: 'パスワード',
    loginButton: 'ログイン',
    lostPass: 'パスワードをお忘れですか？',
    magicPass: 'マジックリンクでログイン',
    newPass: '新しいアカウントを作成',
    createPage: 'ページを作成',
    forCelebrity: '有名人、ブランド、ビジネス向け。',
    googlePass: 'Googleで続行',
    applePass: 'Appleでサインイン',
    privacy: 'プライバシーポリシー',
    terms: '利用規約',
    cookies: 'Cookie設定',
    security: 'セキュリティ',
  },
  zh: {
    quoteLine1: '在 Connectly 上与好友和世界各地的人保持联系。',
    quoteLine2: '分享生活点滴，与志同道合的伙伴随时畅聊。',
    emailPlaceholder: '邮箱地址或手机号',
    passwordPlaceholder: '密码',
    loginButton: '登录',
    lostPass: '忘记密码？',
    magicPass: '使用快捷链接登录',
    newPass: '注册新账号',
    createPage: '创建公共主页',
    forCelebrity: '为名人、品牌或企业创建。',
    googlePass: '通过 Google 继续',
    applePass: '通过 Apple 登录',
    privacy: '隐私政策',
    terms: '服务条款',
    cookies: 'Cookie 设置',
    security: '安全中心',
  },
  hi: {
    quoteLine1: 'Connectly पर अपने दोस्तों और दुनिया से जुड़ें।',
    quoteLine2: 'विचार साझा करें, बातचीत शुरू करें और समुदाय बनाएं।',
    emailPlaceholder: 'ईमेल पता या मोबाइल नंबर',
    passwordPlaceholder: 'पासवर्ड',
    loginButton: 'लॉग इन करें',
    lostPass: 'पासवर्ड भूल गए?',
    magicPass: 'मैजिक लिंक से लॉग इन करें',
    newPass: 'नया खाता बनाएं',
    createPage: 'पेज बनाएं',
    forCelebrity: 'किसी सेलिब्रिटी, ब्रांड या बिज़नेस के लिए।',
    googlePass: 'Google के साथ जारी रखें',
    applePass: 'Apple के साथ साइन इन करें',
    privacy: 'गोपनीयता नीति',
    terms: 'शर्तें',
    cookies: 'कुकीज़',
    security: 'सुरक्षा',
  },
};

interface LanguageContextType {
  currentLanguage: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: Translations;
  languages: LanguageInfo[];
  switchNotification: string | null;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentLanguage, setCurrentLanguageState] = useState<LanguageCode>(() => {
    const saved = localStorage.getItem('connectly_lang');
    return (saved as LanguageCode) || 'en';
  });

  const [switchNotification, setSwitchNotification] = useState<string | null>(null);

  const setLanguage = (lang: LanguageCode) => {
    setCurrentLanguageState(lang);
    localStorage.setItem('connectly_lang', lang);

    const langObj = LANGUAGES.find(l => l.code === lang);
    const msg = `Language switched to ${langObj?.nativeName || lang}`;
    setSwitchNotification(msg);
    setTimeout(() => {
      setSwitchNotification(null);
    }, 2500);
  };

  const t = TRANSLATIONS[currentLanguage] || TRANSLATIONS.en;

  return (
    <LanguageContext.Provider
      value={{
        currentLanguage,
        setLanguage,
        t,
        languages: LANGUAGES,
        switchNotification,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
