import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { RootStore, useAppSelector } from "../store/store";
import { useSelector } from "react-redux";

interface AuthCheckProps {
  children: React.ReactNode;
}

const AuthCheck: React.FC<AuthCheckProps> = (props) => {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);
  const isAuth = useAppSelector((state : RootStore) => state.admin.isAuth);
  const isResellerAuth = useAppSelector((state: RootStore) => state.reseller?.isAuth);

  const publicRoutes = ["/", "/agencyLogin", "/ResellerLogin", "/Registration", "/ForgotPassword"];

  useEffect(() => {
    // Give persist time to rehydrate
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (!isReady) return;

    const currentPath = router.pathname;
    
    // Check if current route is public
    if (publicRoutes.includes(currentPath)) {
      // Allow access to public routes
      return;
    }

    // Check if path is reseller protected route
    if (currentPath.startsWith("/reseller/")) {
      if (!isResellerAuth) {
        router.push("/ResellerLogin");
      }
      return;
    }

    // For all other protected routes, check agency auth
    if (!isAuth) {
      router.push("/");
    }
  }, [router, isAuth, isResellerAuth, isReady]);

  return <>{props.children}</>;
};

export default AuthCheck;