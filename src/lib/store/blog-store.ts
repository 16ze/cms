"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface BlogArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  published: boolean;
  createdAt: string;
  updatedAt?: string;
  image?: string;
}

// Articles par défaut pour initialiser le store
const defaultArticles: BlogArticle[] = [
  {
    id: "1",
    title:
      "IA et SEO en 2025 : Comment Google Gemini révolutionne le référencement",
    content:
      "Analyse détaillée de l'impact des nouveaux algorithmes d'IA de Google sur les stratégies SEO et les méthodes pour adapter votre contenu à cette évolution majeure.",
    excerpt:
      "Analyse de l'impact des nouveaux algorithmes d'IA de Google sur les stratégies SEO et les méthodes pour adapter votre contenu à cette évolution majeure.",
    category: "SEO",
    image: "/images/placeholder-blog.jpg",
    published: true,
    createdAt: "2025-02-12T10:00:00Z",
    updatedAt: "2025-02-12T10:00:00Z",
    slug: "ia-seo-2025-google-gemini",
  },
  {
    id: "2",
    title:
      "Web Components et Micro-Frontends : L'architecture frontale en 2025",
    content:
      "Comment les Web Components et l'approche Micro-Frontends transforment le développement d'applications web modernes avec une meilleure modularité et maintenabilité.",
    excerpt:
      "Comment les Web Components et l'approche Micro-Frontends transforment le développement d'applications web modernes avec une meilleure modularité et maintenabilité.",
    category: "Développement",
    image: "/images/placeholder-blog.jpg",
    published: true,
    createdAt: "2025-03-03T14:30:00Z",
    updatedAt: "2025-03-03T14:30:00Z",
    slug: "web-components-micro-frontends-2025",
  },
  {
    id: "3",
    title:
      "Les Core Web Vitals 2.0 : Nouveaux métriques de performance pour 2025",
    content:
      "Google a mis à jour ses métriques Core Web Vitals avec de nouveaux indicateurs. Découvrez comment optimiser votre site pour ces critères qui impactent directement votre classement.",
    excerpt:
      "Google a mis à jour ses métriques Core Web Vitals avec de nouveaux indicateurs. Découvrez comment optimiser votre site pour ces critères qui impactent directement votre classement.",
    category: "Performance",
    image: "/images/placeholder-blog.jpg",
    published: true,
    createdAt: "2025-03-27T16:45:00Z",
    updatedAt: "2025-03-27T16:45:00Z",
    slug: "core-web-vitals-2-nouveaux-metriques-2025",
  },
  {
    id: "4",
    title:
      "Edge Computing et Serverless : Optimiser les applications web en 2025",
    content:
      "Comment combiner Edge Computing et architectures Serverless pour créer des applications web ultra-performantes avec une latence minimale, même à l'échelle mondiale.",
    excerpt:
      "Comment combiner Edge Computing et architectures Serverless pour créer des applications web ultra-performantes avec une latence minimale, même à l'échelle mondiale.",
    category: "Architecture",
    image: "/images/placeholder-blog.jpg",
    published: true,
    createdAt: "2025-04-15T13:10:00Z",
    updatedAt: "2025-04-15T13:10:00Z",
    slug: "edge-computing-serverless-2025",
  },
  {
    id: "5",
    title:
      "SEO local 2025 : Stratégies pour dominer les recherches géolocalisées",
    content:
      "Les dernières techniques pour optimiser votre présence locale, exploiter Google Business Profile 2.0 et attirer plus de clients dans votre zone géographique.",
    excerpt:
      "Les dernières techniques pour optimiser votre présence locale, exploiter Google Business Profile 2.0 et attirer plus de clients dans votre zone géographique.",
    category: "SEO Local",
    image: "/images/placeholder-blog.jpg",
    published: true,
    createdAt: "2025-04-29T09:30:00Z",
    updatedAt: "2025-04-29T09:30:00Z",
    slug: "seo-local-2025-strategies-recherches-geolocalisees",
  },
  {
    id: "6",
    title:
      "Web3 et commerce électronique : Nouvelles possibilités pour les TPE/PME",
    content:
      "Comment les petites entreprises peuvent tirer parti des technologies Web3, comme les NFT et les smart contracts, pour créer de nouvelles opportunités commerciales.",
    excerpt:
      "Comment les petites entreprises peuvent tirer parti des technologies Web3, comme les NFT et les smart contracts, pour créer de nouvelles opportunités commerciales.",
    category: "Innovation",
    image: "/images/placeholder-blog.jpg",
    published: true,
    createdAt: "2025-05-18T11:25:00Z",
    updatedAt: "2025-05-18T11:25:00Z",
    slug: "web3-ecommerce-tpe-pme-2025",
  },
  {
    id: "7",
    title: "L'impact de l'IA générative sur la création de sites web en 2025",
    content:
      "L'IA générative transforme la conception et le développement web. Découvrez comment l'utiliser efficacement tout en maintenant l'originalité et la qualité de votre présence en ligne.",
    excerpt:
      "L'IA générative transforme la conception et le développement web. Découvrez comment l'utiliser efficacement tout en maintenant l'originalité et la qualité de votre présence en ligne.",
    category: "IA & Design",
    image: "/images/placeholder-blog.jpg",
    published: true,
    createdAt: "2025-06-02T10:00:00Z",
    updatedAt: "2025-06-02T10:00:00Z",
    slug: "ia-generative-creation-sites-web-2025",
  },
  {
    id: "8",
    title:
      "Progressive Web Apps en 2025 : Le nouveau standard pour les sites mobiles",
    content:
      "Les PWA sont désormais incontournables pour offrir une expérience mobile optimale. Découvrez les dernières fonctionnalités et comment les implémenter efficacement.",
    excerpt:
      "Les PWA sont désormais incontournables pour offrir une expérience mobile optimale. Découvrez les dernières fonctionnalités et comment les implémenter efficacement.",
    category: "Mobile",
    image: "/images/placeholder-blog.jpg",
    published: true,
    createdAt: "2025-06-24T14:30:00Z",
    updatedAt: "2025-06-24T14:30:00Z",
    slug: "progressive-web-apps-2025-standard-mobile",
  },
  {
    id: "9",
    title: "GDPR 2.0 et Cookie-less Tracking : Conformité et analytics en 2025",
    content:
      "Les nouvelles régulations européennes et la fin des cookies tiers transforment l'analyse de données. Voici comment rester conforme tout en collectant des données pertinentes.",
    excerpt:
      "Les nouvelles régulations européennes et la fin des cookies tiers transforment l'analyse de données. Voici comment rester conforme tout en collectant des données pertinentes.",
    category: "Légal & Analytics",
    image: "/images/placeholder-blog.jpg",
    published: true,
    createdAt: "2025-07-08T16:45:00Z",
    updatedAt: "2025-07-08T16:45:00Z",
    slug: "gdpr-2-cookieless-tracking-2025",
  },
];

// Fonction pour générer un slug à partir d'un titre
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/--+/g, "-")
    .trim();
}

// Interface pour le store
interface BlogStore {
  articles: BlogArticle[];
  categories: string[];
  setArticles: (articles: BlogArticle[]) => void;
  addArticle: (
    article: Omit<BlogArticle, "id" | "createdAt" | "updatedAt" | "slug">
  ) => BlogArticle;
  updateArticle: (id: string, articleData: Partial<BlogArticle>) => void;
  deleteArticle: (id: string) => void;
  getArticleBySlug: (slug: string) => BlogArticle | undefined;
  getPublishedArticles: () => BlogArticle[];
}

// Création du store
export const useBlogStore = create<BlogStore>()(
  persist(
    (set, get) => ({
      articles: defaultArticles,
      categories: [
        "SEO",
        "Développement",
        "Performance",
        "Architecture",
        "SEO Local",
        "Innovation",
        "IA & Design",
        "Mobile",
        "Légal & Analytics",
      ],
      setArticles: (articles) => set({ articles }),
      addArticle: (articleData) => {
        const newArticle: BlogArticle = {
          ...articleData,
          id: Math.random().toString(36).substring(2, 9),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          slug: generateSlug(articleData.title),
        };

        set((state) => ({
          articles: [...state.articles, newArticle],
        }));

        return newArticle;
      },
      updateArticle: (id, articleData) => {
        set((state) => ({
          articles: state.articles.map((article) =>
            article.id === id
              ? {
                  ...article,
                  ...articleData,
                  updatedAt: new Date().toISOString(),
                  slug: articleData.title
                    ? articleData.slug || generateSlug(articleData.title)
                    : article.slug,
                }
              : article
          ),
        }));
      },
      deleteArticle: (id) => {
        set((state) => ({
          articles: state.articles.filter((article) => article.id !== id),
        }));
      },
      getArticleBySlug: (slug) =>
        get().articles.find((article) => article.slug === slug),
      getPublishedArticles: () =>
        get().articles.filter((article) => article.published),
    }),
    {
      name: "blog-storage",
      skipHydration: true,
    }
  )
);
