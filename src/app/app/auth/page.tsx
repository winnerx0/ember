import React, { Suspense } from "react";
import AuthContent from "~/components/auth-content";
import { Spinner } from "~/components/ui/spinner";

const page = () => {
  return (
    <Suspense
      fallback={
        <div
          className="min-h-screen flex items-center justify-center"
          style={{ background: "var(--background)" }}
        >
          <Spinner size="lg" />
        </div>
      }
    >
      <AuthContent />
    </Suspense>
  );
};

export default page;
