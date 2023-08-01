#!/usr/bin/env deno run --allow-net --allow-env --unstable

// Naive and stupid personal broadcasting relay implementation for Nostr

import { Hono } from "https://deno.land/x/hono@v3.3.0/mod.ts";
import { logger } from "https://deno.land/x/hono@v3.3.0/middleware.ts";


const app = new Hono();

// Pubkeys
const ALLOWED_AUTHORS = new Set<string>([
  // TODO put your pubkeys **hex in lowercase**
  "84b0c46ab699ac35eb2ca286470b85e081db2087cdef63932236c397417782f5"
]);

// Relays
const DESTINATION_RELAYS: string[] = [
  // TODO put your destination relays here
  // "wss://relay.example.com"
  "wss://nos.lol"
];

app.use("*", logger());

app.get("/", (c) => {
  if (c.req.headers.get("upgrade") !== "websocket") {
    // TODO implement NIP-11
 
   return c.json({ message: "please use a Nostr client to connect." }, {
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
  });

  }
  const { socket, response } = Deno.upgradeWebSocket(c.req.raw);

  socket.addEventListener("open", (_e) => {
    console.log("WebSocket opened");
  });

  socket.addEventListener("message", (e) => {
    const event = JSON.parse(e.data);
    if (event[0] === "EVENT") {
      const message = event[1];
      console.log("EVENT", message);
      if (!ALLOWED_AUTHORS.has(message.pubkey)) {
        console.log("Unauthorized EVENT");
        // TODO return NOTICE
        return;
      }

      // TODO validate sig here. Better after checking pubkey to reduce unnecessary calculations.
      // Even if you don't validate, there's a good chance that the relay or the other client will validate...
      for (const relay of DESTINATION_RELAYS) {
        // TODO keep connections to destination relays open
        const ws = new WebSocket(relay);
        ws.addEventListener("open", () => {
          console.log(`[${relay}] Connected`);
          ws.send(e.data);
          console.log(`[${relay}] Sent ${e.data}`);
          ws.close();
          console.log(`[${relay}] Closed`);
        });
      }
    }
  });

  socket.addEventListener("close", (_e) => {
    console.log("WebSocket closed");
  });

  return response;
});

const port = Number(Deno.env.get("PORT")) || 8000;

Deno.serve({ port }, app.fetch);
