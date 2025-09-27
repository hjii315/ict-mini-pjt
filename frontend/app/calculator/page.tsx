import dynamic from "next/dynamic"

const BillCalculator = dynamic(() => import("@/components/bill-calculator"), { ssr: false })

export default function CalculatorPage() {
  return <BillCalculator />
}
