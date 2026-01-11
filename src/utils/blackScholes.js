/**
 * Black-Scholes call option pricing
 * Equivalent to:
 * def black_scholes_call(S, K, T, r, sigma):
 *     d1 = (np.log(S / K) + (r + 0.5 * sigma ** 2) * T) / (sigma * np.sqrt(T))
 *     d2 = d1 - sigma * np.sqrt(T)
 *     call_price = S * norm.cdf(d1) - K * np.exp(-r * T) * norm.cdf(d2)
 *     return call_price
 */
export function blackScholesCall(S, K, T, r, sigma) {
    if (T <= 0) {
        return Math.max(0, S - K);
    }
    const d1 = (Math.log(S / K) + (r + 0.5 * sigma ** 2) * T) / (sigma * Math.sqrt(T));
    const d2 = d1 - sigma * Math.sqrt(T);

    const callPrice = S * standardNormalCDF(d1) - K * Math.exp(-r * T) * standardNormalCDF(d2);
    return callPrice;
}

/**
 * Approximate Cumulative Distribution Function for Standard Normal Distribution
 * Using error function approximation
 */
function standardNormalCDF(x) {
    return (1.0 + erf(x / Math.sqrt(2.0))) / 2.0;
}

/**
 * Error function approximation
 */
function erf(x) {
    // save the sign of x
    var sign = (x >= 0) ? 1 : -1;
    x = Math.abs(x);

    // constants
    var a1 = 0.254829592;
    var a2 = -0.284496736;
    var a3 = 1.421413741;
    var a4 = -1.453152027;
    var a5 = 1.061405429;
    var p = 0.3275911;

    // A&S formula 7.1.26
    var t = 1.0 / (1.0 + p * x);
    var y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
    return sign * y;
}
