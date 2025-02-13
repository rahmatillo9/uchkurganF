export const getToken = () => {
    return typeof window !== "undefined" ? localStorage.getItem("token") : null;
  };
  
  export const isAuthenticated = () => {
    return !!getToken();
  };
  
  export const logout = () => {
    localStorage.removeItem("token");
  };
  