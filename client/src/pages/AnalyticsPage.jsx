import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { listSubscriptions } from '../api'
import Button from '../components/atoms/Button.jsx'
import DataTable from '../components/molecules/DataTable.jsx'
import SummaryCard from '../components/molecules/SummaryCard.jsx'
import ForecastColumns from '../components/molecules/charts/ForecastColumns.jsx'
import TopList from '../components/molecules/lists/TopList.jsx'
import ChartPanel from '../components/organisms/ChartPanel.jsx'
import SubscriptionDetails from '../components/organisms/SubscriptionDetails.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import {
  monthlyForecast,
  mostExpensive,
  savedByCancelling,
  spendingSubscriptions,
  spendTotals,
  topSubscriptions,
} from '../utils/analytics.js'
import { friendlyError } from '../utils/errors.js'
import { DEFAULT_CURRENCY, FREQUENCIES, formatPrice } from '../utils/money.js'
import { hasEnded } from '../utils/schedule.js'
import styles from './AnalyticsPage.module.css'

// "+ $20.00" for money in currencies other than the main one, which can't be
// added into it. Nothing when there are none.
const othersLine = (others, suffix = '') =>
  others.length > 0
    ? `+ ${others.map(({ currency, amount }) => formatPrice(amount, currency) + suffix).join(' + ')}`
    : null

// The Analytics page (/analytics): what your subscriptions add up to. It
// works from the same list the Dashboard loads, so there is nothing new on
// the server; every number is worked out here from that list.
export default function AnalyticsPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [status, setStatus] = useState('loading') // loading | ready | error
  const [subscriptions, setSubscriptions] = useState([])
  const [error, setError] = useState(null)
  // Which subscription's details pop-up is open, by id, or null for none:
  // the same pop-up the Dashboard opens.
  const [openId, setOpenId] = useState(null)

  async function load() {
    setStatus('loading')
    try {
      setSubscriptions(await listSubscriptions())
      setStatus('ready')
    } catch (caught) {
      setError(friendlyError(caught))
      setStatus('error')
    }
  }

  useEffect(() => {
    load()
  }, [])

  // Who counts where, said on the page so the numbers can be checked:
  // paying = Keep and Undecided still running (the spend cards), cancelling =
  // everything marked Cancel (the saved card), ended = the rest, not counted.
  const paying = spendingSubscriptions(subscriptions).length
  const cancelling = subscriptions.filter((sub) => sub.status === 'cancel').length
  const ended = subscriptions.filter((sub) => sub.status !== 'cancel' && hasEnded(sub)).length
  const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`

  // Everything is shown in the currency new subscriptions start in (Account
  // settings), with any other currencies listed underneath.
  const currency = user?.defaultCurrency ?? DEFAULT_CURRENCY
  const money = (amount) => formatPrice(amount, currency)
  // "per month", then any other currencies: the unit lives on this small line
  // rather than in the big number, which keeps the numbers short on a phone.
  const perMonthLine = (...parts) => ['per month', ...parts].filter(Boolean).join(' · ')
  const totals = spendTotals(subscriptions, currency)
  const saved = savedByCancelling(subscriptions, currency)
  const top = mostExpensive(subscriptions, currency)
  const priciest = topSubscriptions(subscriptions, currency, 5)
  const forecast = monthlyForecast(subscriptions, currency)
  // Other currencies that appear anywhere in the forecast get a table column.
  const forecastCurrencies = [...new Set(forecast.flatMap((m) => m.others.map((o) => o.currency)))]
  const forecastOthers = forecastCurrencies
    .map((code) => formatPrice(forecast.reduce((sum, m) => sum + (m.others.find((o) => o.currency === code)?.amount ?? 0), 0), code))
    .join(' + ')
  // "Adobe", or "iCloud, ₱588.00 yearly" when it isn't billed monthly, so the
  // per-month figure above it isn't mistaken for what's actually charged.
  const topDetail =
    top &&
    (top.subscription.frequency === 'monthly'
      ? top.subscription.name
      : `${top.subscription.name}, ${money(top.subscription.price)} ${
          FREQUENCIES.find((f) => f.key === top.subscription.frequency)?.label.toLowerCase() ?? ''
        }`)

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Analytics</h1>

      {/* Grey shapes in the page's own layout while it loads: the cards, then
          two panels side by side. Screen readers get the sentence. */}
      {status === 'loading' && (
        <>
          <p className="sr-only" role="status">
            Loading your analytics…
          </p>
          <div className={styles.cards} aria-hidden="true">
            {[0, 1, 2, 3].map((n) => (
              <div key={n} className={`${styles.skeleton} ${styles.skeletonCard}`} />
            ))}
          </div>
          <div className={styles.panels} aria-hidden="true">
            <div className={`${styles.skeleton} ${styles.skeletonPanel} ${styles.wide}`} />
            <div className={`${styles.skeleton} ${styles.skeletonPanel} ${styles.wide}`} />
          </div>
        </>
      )}

      {status === 'error' && (
        <p className={styles.error} role="alert">
          {error} <Button variant="secondary" onClick={load}>Try again</Button>
        </p>
      )}

      {status === 'ready' && subscriptions.length === 0 && (
        <section className={styles.empty}>
          <h2>Nothing to add up yet</h2>
          <p className={styles.muted}>
            Add your subscriptions and this page shows what they cost you each month and year,
            and what&apos;s about to charge you.
          </p>
          <Button onClick={() => navigate('/add')}>+ Add subscription</Button>
        </section>
      )}

      {status === 'ready' && subscriptions.length > 0 && (
        <>
          <p className={`${styles.muted} ${styles.intro}`}>
            Counting {plural(paying, 'subscription')} you pay for
            {cancelling > 0 && ` and ${cancelling} you're cancelling`}
            {ended > 0 && ` (${ended} ended, not counted)`}. Yearly and weekly plans count as what they
            cost per month.
          </p>

          <div className={styles.cards}>
            <SummaryCard
              label="Per month"
              value={totals.monthly.main}
              format={money}
              detail={othersLine(totals.monthly.others)}
              index={0}
            />
            <SummaryCard
              label="Per year"
              value={totals.yearly.main}
              format={money}
              detail={othersLine(totals.yearly.others)}
              index={1}
            />
            <SummaryCard
              label="Saved by cancelling"
              value={saved.main}
              format={money}
              detail={perMonthLine(othersLine(saved.others))}
              index={2}
            />
            <SummaryCard
              label="Most expensive"
              value={top ? top.monthly : '—'}
              format={money}
              detail={top ? perMonthLine(topDetail) : `Nothing billed in ${currency} yet`}
              index={3}
            />
          </div>

          <div className={styles.panels}>
            <ChartPanel
              className={styles.wide}
              title="Next 12 months"
              description={`What will be charged each month, ${forecast[0].label} ${forecast[0].year} to ${forecast[11].label} ${forecast[11].year}, in ${currency}`}
              chart={<ForecastColumns months={forecast} currency={currency} />}
              table={
                <DataTable
                  caption={`What will be charged each month for the next 12 months`}
                  columns={[
                    { key: 'month', label: 'Month' },
                    { key: currency, label: currency, numeric: true },
                    ...forecastCurrencies.map((code) => ({ key: code, label: code, numeric: true })),
                  ]}
                  rows={forecast.map((m, index) => ({
                    month: `${m.label} ${m.year}${index === 0 ? ' (from today)' : ''}`,
                    [currency]: formatPrice(m.main, currency),
                    ...Object.fromEntries(
                      forecastCurrencies.map((code) => [
                        code,
                        formatPrice(m.others.find((o) => o.currency === code)?.amount ?? 0, code),
                      ])
                    ),
                  }))}
                />
              }
              note={forecastOthers && `Also ${forecastOthers} over these 12 months in other currencies, shown in the table.`}
            />

            <ChartPanel
              className={styles.wide}
              title="Most expensive"
              description={`Per month, in ${currency}`}
              chart={<TopList rows={priciest} currency={currency} onOpen={setOpenId} />}
            />
          </div>
        </>
      )}

      <SubscriptionDetails
        subscription={subscriptions.find((sub) => sub.id === openId) ?? null}
        onClose={() => setOpenId(null)}
        onEdit={(id) => navigate(`/edit/${id}`)}
      />
    </div>
  )
}
