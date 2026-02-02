import { auth } from "../lib/auth";
import { createHonoApp } from "./app";
import profileRouter from "./routes/profile";

const app = createHonoApp();

app.on(["POST", "GET"], "/api/auth/*", (c) => {
  console.log("Auth route hit");
  return auth.handler(c.req.raw);
});

app.on(["POST", "GET"], "/api/admin/*", (c) => {
  return auth.handler(c.req.raw);
});

// Mount profile routes
app.route("/api/profile", profileRouter);

app.get("/api/", async (c) => {
  const result = await c.env.d1_cfw.prepare("SELECT * FROM Customers").run();
  console.log(result);
  const data = result.results;
  const Customers = data.map((item) => item.ContactName).join(", ");
  return c.json({
    name: `Cloudflare and this is deployed perfectly and custumors are :
    
    
  \n\n
    
    
    ${Customers}`,
  });
});


export default app;
