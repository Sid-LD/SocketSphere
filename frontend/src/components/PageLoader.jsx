import { LoaderIcon } from "lucide-react";

// Shown while Clerk is checking if the user is signed in
function PageLoader() {
  return (
    <div className="flex h-dvh items-center justify-center bg-background text-foreground">
      <div className="flex items-center gap-2 text-sm font-medium text-foreground/50">
        <LoaderIcon className="h-4 w-4 animate-spin text-accent" />
        Loading SocketSphere…
      </div>
    </div>
  );
}

export default PageLoader;
