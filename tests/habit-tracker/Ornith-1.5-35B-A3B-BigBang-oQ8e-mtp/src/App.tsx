import { useState } from "react"
import Layout from "./components/Layout"
import Today from "./components/Today"
import Week from "./components/Week"
import Settings from "./components/Settings"

type Tab = "today" | "week" | "settings"

export default function App() {
  const [tab, setTab] = useState<Tab>("today")

  return (
    <Layout active={tab} setActive={setTab}>
      {tab === "today" && <Today />}
      {tab === "week" && <Week />}
      {tab === "settings" && <Settings />}
    </Layout>
  )
}
