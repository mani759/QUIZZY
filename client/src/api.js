import { supabase } from "../src/supabase/supabaseClient";
import { API_URL } from "../src/config/config";

export const apiFetch = async (path, options = {}) => {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;

  return fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
};
