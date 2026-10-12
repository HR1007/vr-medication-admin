import './Placeholder.css'

/** Temporary page body used until each screen is built in its own phase. */
export default function Placeholder({ title, description }: { title: string; description: string }) {
  return (
    <section className="placeholder">
      <h2 className="page-title">{title}</h2>
      <p className="page-subtitle">{description}</p>
      <div className="placeholder__box">此頁面建置中</div>
    </section>
  )
}
