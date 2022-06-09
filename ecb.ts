import { CronJob } from 'cron'
import axios from "axios"

type Currency = {
  name: string
  code: string
  rate: number
}

export class ECB {
  currencies: Currency[] = []
  constructor() {
    new CronJob('0 17 * * *', this.fetchCurrencies, null, true, 'UTC+1')
  }

  fetchCurrencies() {
    axios.get(
      'https://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/index.en.html',
    )
      .then((response) => {
        const currencies: Currency[] = []

        const parser: DOMParser = new DOMParser()
        const document: Document = parser.parseFromString(response.data, 'text/html')
        const rows: HTMLCollection | undefined = document.querySelector(
          `table[class="forextable"] tbody`,
        )?.children
        if (!rows) {
          return
        }

        Array.from(rows).forEach((row) => {
          const code = row.querySelector('.currency a')?.innerHTML
          const name = row.querySelector('.alignLeft a')?.innerHTML
          const rate = row.querySelector('.rate')?.innerHTML

          currencies.push({
            code: code ? code : '',
            name: name ? name : '',
            rate: rate ? parseFloat(rate) : -1,
          })
        })

        this.currencies = currencies
      })
  }

  getCurrencies() {
    return this.currencies
  }
}
