import { Link } from 'react-router-dom'
import { ArrowRight, CheckCircle2, Hourglass, ImagePlus, Inbox, Wallet } from 'lucide-react'
import { useCountUp } from '../hooks/useCountUp.js'
import { StatusBadge, EmptyState } from '../components/ui.jsx'
import { timeAgo, toDate } from '../lib/format.js'

function Stat({ Icon, label, value, prefix = '', tone, to }) {
  const n = useCountUp(value)
  return (
    <Link to={to} className="stat" style={{ '--tone': tone }}>
      <span className="stat-top">
        <small>{label}</small>
        <span className="stat-icon">
          <Icon size={16} />
        </span>
      </span>
      <strong>
        {prefix}
        {n.toLocaleString()}
      </strong>
    </Link>
  )
}

function WeekChart({ orders }) {
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    d.setDate(d.getDate() - (6 - i))
    return d
  })
  const counts = days.map((d) =>
    orders.filter((o) => {
      const t = toDate(o.createdAt)
      return t && t >= d && t < new Date(d.getTime() + 86400000)
    }).length
  )
  const max = Math.max(1, ...counts)
  const total = counts.reduce((a, b) => a + b, 0)
  return (
    <div className="panel">
      <div className="panel-head">
        <h2>Orders this week</h2>
        <small>{total} total</small>
      </div>
      <div className="bars">
        {counts.map((c, i) => (
          <div className="bar-col" key={i}>
            <span className="bar-val">{c || ''}</span>
            <div className="bar-track">
              <i style={{ height: c ? `${Math.max(12, (c / max) * 100)}%` : '4px', animationDelay: `${i * 70}ms` }} className={c === 0 ? 'zero' : ''} />
            </div>
            <small>{days[i].toLocaleDateString(undefined, { weekday: 'short' })}</small>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Dashboard({ orders }) {
  const now = new Date()
  const monthIncome = orders
    .filter((o) => {
      const d = toDate(o.paidAt)
      return o.paid && d && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    })
    .reduce((sum, o) => sum + (Number(o.price) || 0), 0)

  const count = (s) => orders.filter((o) => o.status === s).length
  const unpaid = orders.filter((o) => o.status === 'delivered' && !o.paid).length
  const hour = now.getHours()
  const hello = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  return (
    <>
      <header className="page-head">
        <div>
          <h1>{hello}</h1>
          <p>Here is how things look today.</p>
        </div>
        <Link to="/admin/works" className="btn primary">
          <ImagePlus size={16} /> Add work
        </Link>
      </header>

      <div className="stats">
        <Stat Icon={Inbox} label="New requests" value={count('new')} tone="#B90D0D" to="/admin/orders" />
        <Stat Icon={Hourglass} label="In progress" value={count('progress')} tone="#C77D00" to="/admin/orders" />
        <Stat Icon={CheckCircle2} label="Delivered, unpaid" value={unpaid} tone="#2F6FE4" to="/admin/orders" />
        <Stat Icon={Wallet} label="Paid this month" value={monthIncome} prefix="Rs. " tone="#1F9D55" to="/admin/orders" />
      </div>

      <div className="dash-grid">
        <WeekChart orders={orders} />
        <div className="panel">
          <div className="panel-head">
            <h2>Recent orders</h2>
            <Link to="/admin/orders" className="link">
              See all <ArrowRight size={15} />
            </Link>
          </div>
          {orders.length === 0 ? (
            <EmptyState icon={Inbox} title="No orders yet" text="New requests from your website will appear here." />
          ) : (
            <div className="list">
              {orders.slice(0, 5).map((o) => (
                <Link key={o.id} to="/admin/orders" className="list-row">
                  <span className="avatar">{(o.name || '?')[0].toUpperCase()}</span>
                  <span className="row-main">
                    <strong>{o.name}</strong>
                    <small>
                      {o.service} · {timeAgo(o.createdAt)}
                    </small>
                  </span>
                  <StatusBadge status={o.status} />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
