import type { Locale } from "./translations";

/** Extra localized listing bodies keyed by Django Job.pk — canonical EN comes from API */
export type JobBodyPick = { description: string; requirements: string };

const BODY_RU_UZ: Record<number, { ru: JobBodyPick; uz: JobBodyPick }> = {
  501: {
    ru: {
      description:
        "Мы создаём современные веб-приложения вместе с командой на базе React, TypeScript и дизайн-систем.",
      requirements:
        "Базы HTML, CSS, JavaScript. Опыт с React или другим SPA. Git. Узбекский или английский языки.",
    },
    uz: {
      description:
        "Jamoa bilan zamonaviy veb-ilovalar quramiz — React, TypeScript va dizayn tizimlari.",
      requirements:
        "HTML, CSS, JavaScript asoslari. React yoki boshqa SPA framework. Git. O‘zbek yoki ingliz tili.",
    },
  },
  502: {
    ru: {
      description:
        "Развиваем frontend для локальных и международных клиентов: производственная кодовая база и качественная доставка.",
      requirements:
        "3+ года React. TypeScript, REST API, управление состоянием (Redux/Zustand). Культура code review.",
    },
    uz: {
      description: "Mahalliy va xalqaro mijozlar uchun frontend mahsulotlarini rivojlantiramiz.",
      requirements:
        "3+ yil React. TypeScript, REST API, state management (Redux/Zustand). Code review madaniyati.",
    },
  },
  503: {
    ru: {
      description: "Backend платёжных и учётных сервисов на Django REST и PostgreSQL.",
      requirements:
        "Python, Django или FastAPI. SQL, проектирование REST. Плюс асинхронные задачи (Celery).",
    },
    uz: {
      description: "To‘lov va hisob-kitob servislarining backend qismi — Django REST, PostgreSQL.",
      requirements:
        "Python, Django yoki FastAPI. SQL, REST dizayn. Celery — afzallik.",
    },
  },
  504: {
    ru: {
      description: "Разработка API и микросервисов в небольшой быстрой команде.",
      requirements: "JavaScript/TypeScript, Node.js, основы Express или NestJS. Работа с JSON API.",
    },
    uz: {
      description: "API va mikroservislar ustida ishlang. Kichik, tez jamoa.",
      requirements: "JavaScript/TypeScript, Node.js, Express yoki NestJS. JSON API.",
    },
  },
  505: {
    ru: {
      description: "Образовательная платформа: админка, личный кабинет ученика, отчёты.",
      requirements: "Django REST + React, PostgreSQL. Отладка Docker — плюс.",
    },
    uz: {
      description: "Ta’lim platformasi — admin panel, o‘quvchi kabineti, hisobotlar.",
      requirements: "Django REST, React, PostgreSQL. Docker — afzallik.",
    },
  },
  506: {
    ru: {
      description: "Мобильные приложения iOS и Android на Flutter из одной кодовой базы.",
      requirements: "Dart, Flutter, интеграция REST. Опубликовать в сторах — желательно.",
    },
    uz: {
      description: "iOS va Android uchun Flutter — bitta kod bazasi.",
      requirements: "Dart, Flutter, REST. App Store / Play Console tajribasi afzal.",
    },
  },
  507: {
    ru: {
      description: "Модули приложения здравоохранения для разработчика уровня junior.",
      requirements: "Базовые знания Flutter: виджеты, введение в state management.",
    },
    uz: {
      description: "Sog‘liqni saqlash ilovasi bo‘limlari — junior ishchi.",
      requirements: "Flutter asoslari — widgetlar, state management boshlanishi.",
    },
  },
  508: {
    ru: {
      description: "CI/CD, мониторинг, автоматизация инфраструктуры.",
      requirements: "Linux, Docker, CI (GitHub Actions/GitLab). Облако (AWS и др.). Bash/Python.",
    },
    uz: {
      description: "CI/CD, monitoring, infratuzilmani avtomatlashtirish.",
      requirements: "Linux, Docker, CI. AWS — afzallik. Bash/Python.",
    },
  },
  509: {
    ru: {
      description: "Продуктовый UX/UI в Figma, пользовательские сценарии, тесное взаимодействие с разработчиками.",
      requirements: "Figma, прототипы, основы UX. Нужно портфолио.",
    },
    uz: {
      description: "Figma asosida dizayn — user flow, dizayn tizimlari. Dasturchilar bilan yaqin ish.",
      requirements: "Figma, prototiplash, UX prinsiplari. Portfolio talab qilinadi.",
    },
  },
  510: {
    ru: {
      description: "Высоконагруженные сервисы, потоки данных и внутренние библиотеки на Python.",
      requirements: "5+ лет Python. Системный дизайн, оптимизация PostgreSQL, тесты.",
    },
    uz: {
      description: "Yuqori yuklama, ma’lumotlar oqimi va ichki kutubxonalar — Python.",
      requirements: "5+ yil Python. Tizim dizayni, PostgreSQL optimallashtirish, testlar.",
    },
  },
};

export function localizeJobBody<T extends { id: number; description: string; requirements: string }>(
  job: T,
  locale: Locale,
): T {
  if (locale === "en") return job;
  const pack = BODY_RU_UZ[job.id];
  if (!pack) return job;
  const pick = locale === "ru" ? pack.ru : pack.uz;
  return { ...job, description: pick.description, requirements: pick.requirements };
}
