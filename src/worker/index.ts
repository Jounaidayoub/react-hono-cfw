import { Hono } from "hono";

const app = new Hono<{ Bindings: Env }>();

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
