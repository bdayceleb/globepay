class FXEngine {
    constructor() {
        this.SERVICE_FEE_USD = 4.99;
        this.SERVICE_FEE_INR = 399.00;
        this.FX_MARGIN = 0.005; // 0.5%
        this.GST_RATE = 0.05; // 5% flat for simplicity
        this.TCS_RATE = 0.20; // 20% flat for amounts > 7L
        this.TCS_THRESHOLD_INR = 700000;
    }

    /**
     * Fetches the live mid-market rate from Frankfurter (ECB rates).
     */
    async getLiveMidMarketRate() {
        try {
            const res = await fetch('https://api.frankfurter.app/latest?from=USD&to=INR');
            const data = await res.json();
            return data.rates.INR;
        } catch (error) {
            console.error('[FX Engine] Failed to fetch live rate, falling back:', error);
            return 83.15; // Realistic fallback
        }
    }

    /**
     * Calculates the full quote breakdown for a pitch-ready demo.
     */
    async calculateQuote(sendAmount, direction) {
        const liveUsdToInr = await this.getLiveMidMarketRate();
        const liveInrToUsd = 1 / liveUsdToInr;

        const exchangeRate = direction === 'US_TO_INDIA' ? liveUsdToInr : liveInrToUsd;
        const fromCurrency = direction === 'US_TO_INDIA' ? 'USD' : 'INR';
        const toCurrency = direction === 'US_TO_INDIA' ? 'INR' : 'USD';

        const serviceFee = direction === 'US_TO_INDIA' ? this.SERVICE_FEE_USD : this.SERVICE_FEE_INR;

        // The rate the customer gets (we keep the 0.5% difference)
        const platformRate = exchangeRate * (1 - this.FX_MARGIN);

        // Mid market vs What we give them
        const midMarketValue = sendAmount * exchangeRate;
        const platformValue = sendAmount * platformRate;
        const expectedMargin = Math.abs(midMarketValue - platformValue);

        // Taxes (LRS constraints)
        let taxAmount = 0;
        if (direction === 'INDIA_TO_US') {
            if (sendAmount > this.TCS_THRESHOLD_INR) {
                taxAmount = sendAmount * this.TCS_RATE;
            } else {
                taxAmount = sendAmount * this.GST_RATE;
            }
        }

        const estimatedPayout = platformValue;

        return {
            direction,
            fromCurrency,
            toCurrency,
            sendAmount,
            midMarketRate: exchangeRate,
            platformRate: platformRate,
            expectedMargin, // Hidden from user
            fxSpread: this.FX_MARGIN,
            serviceFee,
            taxAmount,
            estimatedPayout,
        };
    }
}

module.exports = new FXEngine();
