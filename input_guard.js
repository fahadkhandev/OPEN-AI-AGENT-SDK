import "dotenv/config";
import { Agent, InputGuardrailTripwireTriggered, run } from "@openai/agents";
import z from "zod";

const mathInputAgent = new Agent({
  name: "Math query checker",
    instructions: `
    Determine whether the user's input is a mathematics question.
    Return:
    - isvalidMathsQuestion: true if it is a maths question.
    - isvalidMathsQuestion: false otherwise.
    - reason: Explain why it was rejected.
    `,
  outputType: z.object({
    isvalidMathsQuestion: z
      .boolean()
      .describe("if the question is a math question"),
    reason: z.string().optional().describe("reason to reject"),
  }),
});

const mathInputGuardrail = {
  name: "Math HomeWork Guardrail",
  execute: async ({ input }) => {
    const result = await run(mathInputAgent, input);
    return {
      outputInfo: result.finalOutput.reason,
      tripwireTriggered: !result.finalOutput.isvalidMathsQuestion,
    };
  },
};

const mathsAgent = new Agent({
  name: "Maths Agent",
  instructions: "You are an expert Math AI Agent",
  inputGuardrails: [mathInputGuardrail],
});

async function main(q = "") {
  try {
    const result = await run(mathsAgent, q);
    console.log("Result", result.finalOutput);
  } catch (e) {
    if (e instanceof InputGuardrailTripwireTriggered) {
      console.log(`Invalid Input : Rejected because ${e.message}`);
    }
  }
}

main("what is (2+2) +12 = 45");
