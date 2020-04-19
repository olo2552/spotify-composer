import React, { useEffect } from "react";
import { useNavigation } from "react-navi";

export interface RedirectProps {
  href: string;
}

export function Redirect({ href }: RedirectProps) {
  const navigation = useNavigation();
  useEffect(() => {
    navigation.navigate(href);
  }, [href, navigation]);
  return <div>Redirecting...</div>;
}
