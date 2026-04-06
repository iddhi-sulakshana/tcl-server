import { useEffect } from 'react';
import { useLocation } from 'react-router';
import { useLoadingBar } from 'react-top-loading-bar';

export default function Loadingbar() {
  const loadingBar = useLoadingBar();
  const location = useLocation();
  useEffect(() => {
    loadingBar.decrease(100);
    loadingBar.start();
    const timeout1 = setTimeout(() => {
      loadingBar.increase(30);
    }, 250);
    const timeout2 = setTimeout(() => {
      loadingBar.complete();
    }, 500);
    return () => {
      clearTimeout(timeout1);
      clearTimeout(timeout2);
    };
  }, [location]);
  return null;
}
