#!/usr/bin/env deno run --allow-net --allow-env --unstable

// Naive and stupid personal broadcasting relay implementation for Nostr

import { Hono } from "https://deno.land/x/hono@v3.3.0/mod.ts";
import { logger } from "https://deno.land/x/hono@v3.3.0/middleware.ts";


const app = new Hono();

// Pubkeys
const ALLOWED_AUTHORS = new Set<string>([
  // TODO put your pubkeys **hex in lowercase**
  "84b0c46ab699ac35eb2ca286470b85e081db2087cdef63932236c397417782f5",
  "5650178597525e90ea16a4d7a9e33700ac238a1be9dbf3f5093862929d9a1e60"
]);

// Relays
const DESTINATION_RELAYS: string[] = [
  // TODO put your destination relays here
  // "wss://relay.example.com"
  "wss://nos.lol",
  "wss://relay-jp.nostr.wirednet.jp",
  "wss://nostr.fediverse.jp",
  "wss://relay.nostr.moctane.com",
  "wss://nostr.bitcoiner.social",
  "wss://nostr-pub.wellorder.net",
  "wss://yabu.me",
  "wss://r.kojira.io"
  
];

app.use("*", logger());

app.get("/", (c) => {
  
  if (c.req.headers.get("upgrade") !== "websocket") {
    const userAgent=c.req.headers.get("Accept");
    console.log(userAgent);
    if(userAgent && userAgent.includes("application/nostr+json")){ 
    // TODO implement NIP-11
 
   return c.json({ 
    
     contact:"mono",
     description:"personal broadcast relay",
     name: "🥦",
     pubkey:"84b0c46ab699ac35eb2ca286470b85e081db2087cdef63932236c397417782f5",
     software:"https://github.com/TsukemonoGit/personal-broadcast-relay.git",
     supported_nips:[11,20],
     version:"0.0.1",
  //    limitation:{
  //  max_message_length:"",
  //  max_subscriptions:"",
  //  max_filters:"",
  //  auth_required:false,
  //  payment_required:false
  //  }
     }, {
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
  });
}else{
  return c.text("[personal-broadcast-relay]\nplease use a Nostr client to connect.");
  }
}
  const { socket, response } = Deno.upgradeWebSocket(c.req.raw);

  socket.addEventListener("open", (_e) => {
    console.log("WebSocket opened");
  });

  socket.addEventListener("message", async (e) => {
    const event = JSON.parse(e.data);
    if (event[0] === "EVENT") {
      const message = event[1];
      console.log("EVENT", message);
      if (!ALLOWED_AUTHORS.has(message.pubkey)) {
        console.log("Unauthorized EVENT");
        // TODO return NOTICE
        //socket.send(["NOTICE","Unauthorized EVENT"]);
        socket.send(JSON.stringify(["OK",event[1],false,"Unauthorized EVENT"]));
        return ;
      }

         // TODO validate sig here. Better after checking pubkey to reduce unnecessary calculations.
    // Even if you don't validate, there's a good chance that the relay or the other client will validate...
    let res: string = "";
    let issuccess: boolean = false;
    let completedRelays = 0; // 返答を待っているリレーの数

    for (const relay of DESTINATION_RELAYS) {
      try {
        const ws = new WebSocket(relay);
        await new Promise<void>((resolve) => {
          ws.addEventListener("open", () => {
            console.log(`[${relay}] Connected`);
            ws.send(e.data);
            console.log(`[${relay}] Sent ${e.data}`);
          });

          ws.addEventListener("message", (e) => {
            const event = JSON.parse(e.data);
            // ... your existing code ...

            completedRelays++; // リレーからの返答が来たのでカウントを増やす

            if (completedRelays === DESTINATION_RELAYS.length) {
              // すべてのリレーからの返答が揃ったら、socket.sendする
              console.log(res);
              socket.send(JSON.stringify(["OK", event[1], issuccess, res]));
              ws.close(); // Close the WebSocket after all responses are received
              resolve(); // Resolve the Promise to continue with the next relay
            }
          });
        });
      } catch (error) {
        console.error(`[${relay}] Error: ${error.message}`);
        completedRelays++; // Even if there's an error, count it as a completed relay
      }
    }
  } else if (event[0] === "REQ") {
    console.log("REQきたで")
   // socket.send(["NOTICE", "Unauthorized EVENT"]);
    socket.send(JSON.stringify(["EOSE", event[1]]));
    return;
  } else {
    console.log(event);
  }
});

  socket.addEventListener("CLOSE", (_e) => {
    console.log("WebSocket closed");
    socket.close(); // WebSocket接続をクローズ
  });

  return response;
});

const port = Number(Deno.env.get("PORT")) || 8000;

Deno.serve({ port }, app.fetch);
