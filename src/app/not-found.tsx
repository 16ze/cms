import Link from "next/link";
import contentData from "@/config/content.json";

export default function NotFound() {
  // Import direct du JSON - Pas de fetch, pas de flash de contenu
  const notFoundContent = contentData.notFound;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">
          {notFoundContent?.title}
        </h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">
          {notFoundContent?.heading}
        </h2>
        <p className="text-gray-600 mb-8">{notFoundContent?.message}</p>
        <Link
          href={notFoundContent?.buttonUrl || "/"}
          className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          {notFoundContent?.button}
        </Link>
      </div>
    </div>
  );
}
