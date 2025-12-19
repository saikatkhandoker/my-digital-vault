import { NavBar } from '@/components/NavBar';
import { Footer } from '@/components/Footer';
import { LinkForm } from '@/components/links/LinkForm';
import { LinkGrid } from '@/components/links/LinkGrid';
import { LinkSearchBar } from '@/components/links/LinkSearchBar';
import { LinkCategoryManager } from '@/components/links/LinkCategoryManager';
import { LinkCategoryFilter } from '@/components/links/LinkCategoryFilter';
import { LinkProvider } from '@/context/LinkContext';
import { DataManagementDialog } from '@/components/DataManagementDialog';

const Links = () => {
  return (
    <LinkProvider>
      <div className="min-h-screen bg-background flex flex-col">
        <NavBar importExportButton={<DataManagementDialog />} />
        
        <main className="container py-8 flex-1">
          <div className="mx-auto max-w-6xl space-y-8">
            {/* Link Input Form */}
            <section>
              <h2 className="mb-4 text-lg font-semibold text-foreground">Add New Link</h2>
              <LinkForm />
            </section>

            {/* Search and Links */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Your Links</h2>
                  <p className="text-sm text-muted-foreground">Search and manage your saved links</p>
                </div>
                <LinkCategoryManager />
              </div>

              {/* Category Filter */}
              <LinkCategoryFilter />

              {/* Search Bar */}
              <LinkSearchBar />
            </section>

            {/* Link Grid */}
            <section>
              <LinkGrid />
            </section>
          </div>
        </main>

        <Footer />
      </div>
    </LinkProvider>
  );
};

export default Links;
