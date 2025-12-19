import { NavBar } from '@/components/NavBar';
import { Footer } from '@/components/Footer';
import { VideoForm } from '@/components/VideoForm';
import { VideoGrid } from '@/components/VideoGrid';
import { CategoryFilter } from '@/components/CategoryFilter';
import { PlatformFilter } from '@/components/PlatformFilter';
import { CategoryManager } from '@/components/CategoryManager';
import { SearchBar } from '@/components/SearchBar';
import { VideoProvider } from '@/context/VideoContext';
import { DataManagementDialog } from '@/components/DataManagementDialog';

const Index = () => {
  return (
    <VideoProvider>
      <div className="min-h-screen bg-background flex flex-col">
        <NavBar importExportButton={<DataManagementDialog />} />
        
        <main className="container py-8 flex-1">
          <div className="mx-auto max-w-6xl space-y-8">
            {/* Video Input Form */}
            <section>
              <h2 className="mb-4 text-lg font-semibold text-foreground">Add New Video</h2>
              <VideoForm />
            </section>

            {/* Filters and Category Management */}
            <section className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Your Videos</h2>
                  <p className="text-sm text-muted-foreground">Search, filter by platform or category</p>
                </div>
                <CategoryManager />
              </div>

              {/* Search Bar */}
              <SearchBar />
              
              {/* Platform Filter */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">Platform</h3>
                <PlatformFilter />
              </div>
              
              {/* Category Filter */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">Category</h3>
                <CategoryFilter />
              </div>
            </section>

            {/* Video Grid */}
            <section>
              <VideoGrid />
            </section>
          </div>
        </main>

        <Footer />
      </div>
    </VideoProvider>
  );
};

export default Index;
