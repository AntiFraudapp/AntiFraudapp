import { UserProfileMenu } from "@/components/UserProfileMenu";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { useI18n } from "@/i18n/I18nProvider";
import { LogIn, LogOut, User } from "lucide-react";

export function AuthControl() {
  const { identity, login, isLoggingIn, isInitializing } =
    useInternetIdentity();
  const { t } = useI18n();

  const isAuthenticated = identity && !identity.getPrincipal().isAnonymous();

  if (isInitializing) {
    return null;
  }

  if (!isAuthenticated) {
    return (
      <Button
        onClick={login}
        disabled={isLoggingIn}
        variant="default"
        size="sm"
        className="text-sm sm:text-base"
      >
        <LogIn className="mr-2 h-4 w-4" />
        {isLoggingIn ? t.loggingIn : t.login}
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="text-sm sm:text-base">
          <User className="mr-2 h-4 w-4" />
          <span className="hidden sm:inline">{t.profile}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <UserProfileMenu />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
