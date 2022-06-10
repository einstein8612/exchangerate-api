import express from 'express'
import { ECB } from './ecb'

const ecbClient = new ECB()
ecbClient.fetchCurrencies()

const app = express()
app.disable('x-powered-by')

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(process.env.PORT || 80, () => {
  console.log(`Server started on port ${process.env.PORT || 80}`)
})

const apiRouter: express.Router = express.Router()
apiRouter.use((req, res, next) => {
  res.set('Accept', 'application/json')
  res.set('X-Server', 'Einstein#0001')

  res.type('application/json')
  next()
})

apiRouter.get('/', (_, res) => {
  res.redirect('/')
})

apiRouter.get('/rates', (req, res) => {
  const base: string = req.query.base ? String(req.query.base) : 'EUR'
  const amount: number = req.query.amount ? parseFloat(req.query.amount ? String(req.query.amount) : "0") : 1
  const currencies = ecbClient.getCurrencies()
  const baseCurrency: Currency = currencies.filter(
    (currency) => currency.code === base,
  )[0]
  if (!baseCurrency) {
    res.status(404).send({ error: "this currency wasn't recognised" })
    return
  }
  const euroPerBase: number = 1 / baseCurrency.rate

  const response = {
    base: base,
    amount: amount,
    last_updated: ecbClient.getLastUpdated(),
    currencies: currencies.map((currency) => {
      return {
        key: currency.code,
        value: {
          name: currency.name,
          code: currency.code,
          rate: currency.rate * euroPerBase * amount,
        },
      }
    }),
  }

  res.send(response)
})

app.use('/api/v1', apiRouter)
