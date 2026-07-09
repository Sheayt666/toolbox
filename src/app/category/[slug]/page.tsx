import { Suspense } from "react";
import CategoryContent from "@/components/CategoryContent";

export const runtime = "edge";

export default function CategoryPage() {
  return (
    <Suspense fallback={null}>
      <CategoryContent />
    </Suspense>
  );
}
