"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Login from "./agencyLogin";
import Registration from "./Registration";
import axios from "axios";
import { baseURL, key } from "@/utils/config";
import { apiInstance, apiInstanceFetch } from "@/utils/ApiInstance";

const Home = (res: any) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const currentRole = sessionStorage.getItem("currentRole");
      const token = sessionStorage.getItem("token");
      
      // If user is authenticated, redirect to dashboard
      if (token && currentRole) {
        router.push("/dashboard");
      } 
      // If reseller tries to access agency login, redirect to reseller login
      else if (currentRole === "reseller") {
        router.push("/ResellerLogin");
      }
      // Otherwise show agency login
      else {
        setIsLoading(false);
      }
    }
  }, [router]);

  if (isLoading) {
    return null; // Or a loading spinner
  }

  return <Login />;
};

export default Home;
