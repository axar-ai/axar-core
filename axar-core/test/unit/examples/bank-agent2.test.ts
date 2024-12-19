import { describe, it, expect, jest } from "@jest/globals";
import {
	SupportResponseSchema,
	SupportAgent,
	DatabaseConn,
} from "../../../src/examples/bank-agent2"; // Adjust import path as needed
import "reflect-metadata";

const mockDatabaseConn: jest.Mocked<DatabaseConn> = {
	customerName: jest.fn(),
	customerBalance: jest.fn(),
};

describe("SupportAgent", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it("should return a valid customer context", async () => {
		mockDatabaseConn.customerName.mockResolvedValue("John");

		const agent = new SupportAgent(123, mockDatabaseConn);

		const context = await agent["getCustomerContext"]();
		expect(context).toBe("The customer's name is 'John'");
		expect(mockDatabaseConn.customerName).toHaveBeenCalledWith(123);
	});

	it("should return the customer balance", async () => {
		mockDatabaseConn.customerBalance.mockResolvedValue(5047.71);

		const agent = new SupportAgent(123, mockDatabaseConn);

		const balance = await agent.getCustomerBalance({
			customerName: "John",
			includePending: true,
		});

		expect(balance).toBe(5047.71);
		expect(mockDatabaseConn.customerBalance).toHaveBeenCalledWith(
			123,
			"John",
			true
		);
	});

	it("should handle simple queries and validate response schema", async () => {
		const mockRun = jest
			.spyOn(SupportAgent.prototype, "run")
			.mockResolvedValue({
				support_advice: "Your balance is $5047.71.",
				block_card: false,
				risk: 0.1,
				status: "Happy",
			});

		const agent = new SupportAgent(123, mockDatabaseConn);
		const result = await agent.run("What is my balance?");

		const parsed = SupportResponseSchema.safeParse(result);
		expect(parsed.success).toBe(true);

		expect(result.support_advice).toBe("Your balance is $5047.71.");
		expect(result.block_card).toBe(false);
		expect(result.risk).toBe(0.1);
		expect(result.status).toBe("Happy");

		mockRun.mockRestore();
	});

	it("should handle lost card scenario", async () => {
		const mockRun = jest.spyOn(SupportAgent.prototype, "run");
		mockRun.mockResolvedValue({
			support_advice: "We recommend blocking your card immediately.",
			block_card: true,
			risk: 0.9,
		});

		const agent = new SupportAgent(123, mockDatabaseConn);
		const result = await agent.run("I just lost my card!");

		const parsed = SupportResponseSchema.safeParse(result);
		expect(parsed.success).toBe(true);

		expect(result.support_advice).toBe(
			"We recommend blocking your card immediately."
		);
		expect(result.block_card).toBe(true);
		expect(result.risk).toBe(0.9);

		mockRun.mockRestore();
	});
});
