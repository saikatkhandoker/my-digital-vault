import { Youtube, Link as LinkIcon, Heart } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="container py-8">
        <div className="grid gap-8 md:grid-cols-3">
          {/* Brand */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Manager</h3>
            <p className="text-sm text-muted-foreground">
              Organize and manage your favorite videos and links in one place.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Quick Links
            </h4>
            <nav className="flex flex-col gap-2">
              <a 
                href="/" 
                className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-2"
              >
                <Youtube className="h-4 w-4" />
                Videos
              </a>
              <a 
                href="/links" 
                className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-2"
              >
                <LinkIcon className="h-4 w-4" />
                Links
              </a>
            </nav>
          </div>

          {/* Info */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              About
            </h4>
            <p className="text-sm text-muted-foreground">
              A simple tool to save and organize your video and link bookmarks with categories and tags.
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © {currentYear} Manager. All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground inline-flex items-center gap-1">
            Made with <Heart className="h-3 w-3 text-destructive fill-destructive" /> for productivity
          </p>
        </div>
      </div>
    </footer>
  );
}