import { Hono } from "hono";
import type { WSContext } from "hono/ws";
import { upgradeWebSocket } from "hono/deno";
import { redis } from "./utils/redis.ts";

const app = new Hono();

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

const subscriber = redis.duplicate();

await subscriber.subscribe("whiteboard");

subscriber.on("message", (_, message) => {
  console.log("Retransmit at " + new Date().toISOString());
  wsClients.forEach((ws) => {
    ws.send(message);
  });
});

const wsClients: WSContext<WebSocket>[] = [];

app.get(
  "/ws",
  upgradeWebSocket((_) => {
    return {
      onOpen(_, ws) {
        console.log("Connection opened");
        wsClients.push(ws);
      },
      onMessage(event) {
        redis.publish("whiteboard", event.data.toString());
      },
      onClose(_, ws) {
        wsClients.splice(wsClients.indexOf(ws), 1);
        console.log("Connection closed");
      },
    };
  }),
);

Deno.serve(app.fetch);
