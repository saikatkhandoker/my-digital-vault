import { NavBar } from '@/components/NavBar';
import { LinkForm } from '@/components/links/LinkForm';
import { LinkGrid } from '@/components/links/LinkGrid';
import { LinkSearchBar } from '@/components/links/LinkSearchBar';
import { LinkCategoryManager } from '@/components/links/LinkCategoryManager';
import { LinkProvider } from '@/context/LinkContext';

const Links = () => {
  return (
    <LinkProvider>
      <div className="min-h-screen bg-background">
        <NavBar />
        
        <main className="container py-8">
          <div className="mx-auto max-w-6xl space-y-8">
            {/* Link Input Form */}
            <section>
              <h2 className="mb-4 text-lg font-semibold text-foreground">Add New Link</h2>
              <LinkForm />
            </section>

            {/* Category Manager */}
            <section>
              <LinkCategoryManager />
            </section>

            {/* Search and Links */}
            <section className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Your Links</h2>
                <p className="text-sm text-muted-foreground">Search and manage your saved links</p>
              </div>

              {/* Search Bar */}
              <LinkSearchBar />
            </section>

            {/* Link Grid */}
            <section>
              <LinkGrid />
            </section>
          </div>
        </main>
      </div>
    </LinkProvider>
  );
};

export default Links;
