import { EnrichedInvoice, EnrichedPerformance, Invoice, Performance } from "@/types/Invoice";
import { Play, Plays } from "@/types/play";

function createPerformanceCalculator(aPerformance: Performance, aPlay: Play) {
	return new PerformanceCalculator(aPerformance, aPlay);
}

class PerformanceCalculator {
	constructor(private readonly _performance: Performance, private readonly _play: Play) {}

	get performance() {
		return this._performance;
	}

	get play() {
		return this._play;
	}

	get amount() {
		let result = 0;

		switch (this.play.type) {
			case "tragedy":
				result = 40000;
				if (this.performance.audience > 30) {
					result += 1000 * (this.performance.audience - 30);
				}
				break;
			case "comedy":
				result = 30000;
				if (this.performance.audience > 20) {
					result += 10000 + 500 * (this.performance.audience - 20);
				}
				result += 300 * this.performance.audience;
				break;
			default:
				throw new Error(`알 수 없는 장르: ${this.play.type}`);
		}
		return result;
	}

	get volumeCredits() {
		let result = 0;
		result += Math.max(this.performance.audience - 30, 0);
		if ("comedy" === this.play.type) {
			result += Math.floor(this.performance.audience / 5);
		}
		return result;
	}
}

export function createStatementData(invoice: Invoice, plays: Plays) {
	const result = {} as EnrichedInvoice;
	result.customer = invoice.customer;
	result.performances = invoice.performances.map(enrichPerformance);
	result.totalAmount = totalAmount(result);
	result.totalVolumeCredits = totalVolumeCredits(result);
	return result;

	function enrichPerformance(aPerformance: Performance) {
		const calculator = createPerformanceCalculator(aPerformance, playFor(aPerformance));
		const result = { ...aPerformance } as EnrichedPerformance;
		result.play = calculator.play;
		result.amount = calculator.amount;
		result.volumeCredits = calculator.volumeCredits;
		return result;
	}

	function playFor(aPerformance: Performance) {
		return plays[aPerformance.playID];
	}

	function totalAmount(data: EnrichedInvoice) {
		return data.performances.reduce((total, p) => total + p.amount, 0);
	}

	function totalVolumeCredits(data: EnrichedInvoice) {
		return data.performances.reduce((total, p) => total + p.volumeCredits, 0);
	}
}
