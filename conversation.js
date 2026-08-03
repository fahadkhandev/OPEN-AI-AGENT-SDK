import "dotenv/config";
import { Agent, run, tool } from "@openai/agents";
import { z } from "zod";


// let sharedHistory = [] // when we have conversation id then no need of storing it manully bcz open ai can store it in its own database and we can fetch it using conversation id

const execute_sql = tool({
  name: "execute_sql",
  description: "This executes the SQL Query",
  parameters: z.object({
    sql: z.string().describe("the sql query")
  }),
  execute: async function ({sql}){
    console.log(`[SQL]: Execute ${sql}`);
  }
});

const sqlAgent = new Agent({
  name: "SQL Expert Agent",
  instructions: `
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
});


async function main(q=''){
    // sharedHistory.push({role : 'user', content:q}) when dont have DB then we also have no shared memory
    const result = await run(sqlAgent,q,{
      conversationId : 'conv_6a6e4bc2b7f88190ba2f9f90ad67d16903bfaf8218464400' // this is the conversation id which we got from create-conversation.js file
    })
    // sharedHistory = result.history //insert into messages
    console.log(result.finalOutput);
}

main("Hey my name is Fahad").then(()=>{
    main("Get me all the users with my name")
})
