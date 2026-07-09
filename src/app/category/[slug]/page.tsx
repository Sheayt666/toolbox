import { Suspense } from "react";
import CategoryContent from "@/components/CategoryContent";

export default function CategoryPage() {
  return (
    <Suspense fallback={null}>
      <CategoryContent />
    </Suspense>
  );
}
