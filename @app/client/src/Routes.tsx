import * as React from "react";
import { mount, route, map } from "navi";

const routes = mount({
  "/": route({
    getView: () => import("./routes/Home"),
  }),
  "/login": map(async (_request, _context) =>
    route({
      getView: async (req, _context) => {
        const { Login } = await import("./routes/Login");
        return <Login next={req.params.next} />;
      },
    })
  ),
  "/register": route({
    getView: () => import("./routes/Register"),
  }),
  "/verify": map(async (_request, _context) =>
    route({
      getView: async ({ params: { id, token } }, _context) => {
        const { Verify } = await import("./routes/Verify");
        const idNum = typeof id === "string" ? parseInt(id, 10) || null : null;
        return <Verify id={idNum} token={token} />;
      },
    })
  ),
  "/reset": map(async (_request, _context) =>
    route({
      getView: async ({ params: { user_id, token } }, _context) => {
        const { Reset } = await import("./routes/Reset");
        const userIdNum =
          typeof user_id === "string" ? parseInt(user_id, 10) || null : null;
        return <Reset userId={userIdNum} token={token} />;
      },
    })
  ),
  "/forgot": route({
    getView: () => import("./routes/Forgot"),
  }),
  "/settings": mount({
    "/": route({
      getView: () => import("./routes/settings/Index"),
    }),
    "/security": route({
      getView: () => import("./routes/settings/Security"),
    }),
    "/accounts": route({
      getView: () => import("./routes/settings/Accounts"),
    }),
    "/delete": route({
      getView: () => import("./routes/settings/Delete"),
    }),
    "/emails": route({
      getView: () => import("./routes/settings/Emails"),
    }),
  }),
});

export default routes;
