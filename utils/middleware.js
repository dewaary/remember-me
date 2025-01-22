import { useEffect } from "react";
import { useRouter } from "next/navigation"

const useAuth = () => {
  const router = useRouter();

  useEffect(() => {
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("authToken="));

    if (!token) {
      router.push("/login");
    }
  }, [router]);
};

export default useAuth;