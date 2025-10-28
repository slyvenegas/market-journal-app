import TradingViewWidget from "@/components/TradingViewWidget"
import { MARKET_DATA_WIDGET_CONFIG } from "@/lib/constants"

const Home = () => {
  return (
    <div className="flex min-h-screen home-wrapper">
      <section className="grip w-full gap-8 home-section">
        <div className="md:col-span-1 xl:col-span-1">
          <TradingViewWidget
            title="Market Overview"
            scriptUrl="https://s3.tradingview.com/external-embedding/embed-widget-market-overview.js"
            config={MARKET_DATA_WIDGET_CONFIG}
            className="custom-chart"
            height={600}
          />
          </div>
          <div className="md:col-span-1 xl:col-span-2">
            <TradingViewWidget
            title="Market Overview"
            scriptUrl="https://s3.tradingview.com/external-embedding/embed-widget-market-overview.js"
            config={MARKET_DATA_WIDGET_CONFIG}
            className="custom-chart"
            height={600}
          />
          </div>
      </section>
    </div>
  )
}

export default Home



