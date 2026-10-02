import { io } from "socket.io-client";
import { API_URL } from "../src/config/config";
import { supabase } from "../src/supabase/supabaseClient";

const hostSocket = io(API_URL, {
  autoConnect: false,
  auth: async (cb) => {
    const { data } = await supabase.auth.getSession();
    cb({ token: data.session?.access_token ?? null });
  },
});

export default hostSocket;
