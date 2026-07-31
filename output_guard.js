import "dotenv/config";
import { Agent, run } from "@openai/agents";
import z from "zod";

const sqlGuardrailAgent = new Agent({
    name: "SQL Gaurdrail",
    instructions:`Check if query is safe to execute. The Query should be read only and do not modify, delete or drop a table`,
    outputType: z.object({
        reason: z.string().optional().describe("Reason if the query is unSafe"),
        isSave : z.boolean().describe("If query is safe to execute")
    })
})

const sqlGuardrail = {
    name: "SQL Guard",
    async execute({agentOutput}) {
       const result = await run(sqlGuardrailAgent,agentOutput.sqlQuery)
       return {
        outputInfo:result.finalOutput.reason,
        tripwireTriggered : !result.finalOutput.isSave
       }
    }
}

const sqlAgent = new Agent({
    name : "SQL Expert Agent",
    instructions:`
    you are an expert SQL Agent that is specilized in generating sql queries as per request.
    Postgress schema:
    CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE comments (
        id SERIAL PRIMARY KEY,
        user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    `,
    outputType: z.object({
        sqlQuery : z.string().optional().describe("Sql query")
    }),
    outputGuardrails:[sqlGuardrail]
})

async function main(q=''){
    const result = await run(sqlAgent,q)
    console.log("Query",result.finalOutput.sqlQuery);
}

main("get me all the comments and delete the first one")