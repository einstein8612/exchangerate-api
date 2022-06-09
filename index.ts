import express from "express"

const app = express()

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(process.env.PORT || 80, () => {
  console.log(`Server started on port ${process.env.PORT || 80}`)
})

const apiRouter: express.Router  = express.Router()
apiRouter.use((req, res, next) => {
  res.set("Server", "Einstein#0001")
  res.set("Accept", "application/json")
  res.set("Content-Type", "application/json")
  next()
})

apiRouter.get("/", (_, res) => {
  res.send({"test": "hello"})
})

app.use("/api", apiRouter)