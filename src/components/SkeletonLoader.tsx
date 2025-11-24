'use client';

export function SiteCardSkeleton() {
  return (
    <div className="h-32 bg-card border border-border rounded-xl p-4 animate-pulse">
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 bg-muted rounded-lg" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-muted rounded w-3/4" />
          <div className="h-3 bg-muted rounded w-full" />
          <div className="h-3 bg-muted rounded w-5/6" />
        </div>
      </div>
    </div>
  );
}

export function SectionSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-5 bg-muted rounded w-32 animate-pulse" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <SiteCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export function CategorySkeleton() {
  return (
    <div className="mb-16">
      <div className="flex items-center gap-4 mb-8">
        <div className="h-8 bg-muted rounded w-32 animate-pulse" />
        <div className="h-px flex-1 bg-border" />
      </div>
      <div className="space-y-12">
        {[...Array(2)].map((_, i) => (
          <SectionSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar Skeleton */}
      <nav className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-muted animate-pulse" />
            <div className="h-5 w-32 bg-muted rounded animate-pulse hidden sm:block" />
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-8 w-20 bg-muted rounded-full animate-pulse" />
              ))}
            </div>
            <div className="h-8 w-8 bg-muted rounded-full animate-pulse" />
          </div>
        </div>
      </nav>

      {/* Hero Skeleton */}
      <header className="py-20 sm:py-32">
        <div className="container mx-auto px-4 text-center">
          <div className="h-12 bg-muted rounded w-96 mx-auto mb-6 animate-pulse" />
          <div className="h-6 bg-muted rounded w-[500px] mx-auto mb-10 animate-pulse" />
          <div className="max-w-xl mx-auto">
            <div className="h-12 bg-muted rounded-full animate-pulse" />
          </div>
        </div>
      </header>

      {/* Content Skeleton */}
      <main className="container mx-auto px-4 pb-20">
        {[...Array(2)].map((_, i) => (
          <CategorySkeleton key={i} />
        ))}
      </main>
    </div>
  );
}
