import { CronJob } from 'cron'
import { JSDOM } from 'jsdom'
import axios from 'axios'

export class ECB {
  lastUpdated: Date = new Date()
  currencies: Currency[] = []
  constructor() {
    new CronJob('0 17 * * *', this.fetchCurrencies, null, true, 'UTC+1')
  }

  fetchCurrencies() {
    axios
      .get(
        'https://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/index.en.html',
      )
      .then((response) => {
        const currencies: Currency[] = []

        const dom: JSDOM = new JSDOM(response.data)
        const rows:
          | HTMLCollection
          | undefined = dom.window.document.querySelector(
          `table[class="forextable"] tbody`,
        )?.children
        if (!rows) {
          return
        }

        Array.from(rows).forEach((row) => {
          const code = row.querySelector('.currency a')?.textContent
          const name = row.querySelector('.alignLeft a')?.textContent
          const rate = row.querySelector('.rate')?.textContent

          currencies.push({
            code: code ? code : '',
            name: name ? name : '',
            rate: rate ? parseFloat(rate) : -1,
          })
        })

        currencies.push({
          code: 'EUR',
          name: 'Euro',
          rate: 1,
        })

        this.lastUpdated = new Date()
        this.currencies = currencies
      })
  }

  getCurrencies() {
    return this.currencies
  }

  getLastUpdated() {
    return this.lastUpdated
  }
}
