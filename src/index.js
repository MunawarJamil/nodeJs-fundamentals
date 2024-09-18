import db_connection from "./db/index.js";
import { app } from "./app.js";
db_connection()
  .then(() => {
    const port = 43000;
    app.listen(port, () => {
      console.log(`app is listening on port ${port}`);
    });
  })
  .catch((error) => {
    console.log("failed to set the server", error);
  });
app.get("/", (req, res) => {
  res.send("server is running");
});

//db_connection will return a promise either fulfilled or rejected
// fulfilled then listen server on port else through error
