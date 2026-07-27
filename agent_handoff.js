import "dotenv/config";
import { Agent, tool, run } from "@openai/agents";
import {RECOMMENDED_PROMPT_PREFIX} from "@openai/agents-core/extensions" // for handoffs 
import z from "zod";

import fs from "node:fs/promises";

const fetchAvailblePlans = tool({
  name: "fetch_available_plans",
  description: "fetch available plans for the internet.",
  parameters: z.object({}),
  execute: async function () {
    return [
      {
        plan_id: 1,
        plan_name: "Basic Plan",
        speed: "10 Mbps",
        price: "$20/month",
      },
      {
        plan_id: 2,
        plan_name: "Standard Plan",
        speed: "50 Mbps",
        price: "$40/month",
      },
      {
        plan_id: 3,
        plan_name: "Premium Plan",
        speed: "100 Mbps",
        price: "$60/month",
      },
    ];
  },
});
const processRefund = tool({
  name: "process_refund",
  description: "This tool process the refund for the customer",
  parameters: z.object({
    customerId: z.string().describe("customer id of the user"),
    reason: z.string().describe("reason for refund"),
  }),
  execute: async function ({ customerId, reason }) {
    await fs.appendFile(
      "./refund.txt",
      `Refund for customer ${customerId} with reason ${reason}\n`,
      "utf-8",
    );
    return { refundIssue: true };
  },
});
const refundAgent = new Agent({
  name: "Refund Agent",
  instructions:
    "You are an expert in issuing refunds for an internet broadband company. You will help user to get refund for their plan.",
  tools: [processRefund],
});
const salesAgent = new Agent({
  name: "Sales Agent",
  model: "gpt-4o",
  instructions:
    "You are an expert sales agent for an internet broadband company. Talk to user and help them with what they need.",
  tools: [
    fetchAvailblePlans,
    refundAgent.asTool({
      toolName: "refund_expert",
      toolDescription: "Handles refund questions and requests.",
    }),
  ],
});


const receptionAgent = new Agent({
  name: "Reception Agent",
  model: "gpt-4o",
  instructions:`${RECOMMENDED_PROMPT_PREFIX}
    you are customer facing agent expert in understanding what customer need and then route them or handoff them to the right agent.`,
  handoffDescription: `You have two agents available : 
    - salesAgent: Expert in handling queires like all plans and pricing available , and good for new customers.
    - refundAgent: Expert in handling user queires for. existing customers and issue refunds and help them `,
  handoffs: [salesAgent, refundAgent],
});


async function main(query = ''){
    const result = await run(receptionAgent, query)
    console.log(`Result:`,result.finalOutput)
    console.log(`Result:`,result.history)
}

main(`hey there, can u tell me which plan is best for me? show me all the availble plans .`)