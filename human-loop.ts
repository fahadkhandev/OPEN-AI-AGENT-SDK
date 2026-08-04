import 'dotenv/config'
import { Agent,run,tool } from '@openai/agents'
import z from 'zod'
import fs from 'node:fs/promises';
import readline from 'node:readline/promises';
import axios from 'axios'
import nodemailer from "nodemailer";


const getWeatherTool = tool({
    name: 'get_weather',
    description: 'return the current weather information for the given city.',
    parameters: z.object({
        city: z.string().describe(' name of the city ')
    }),
    execute: async function({city}) {
        const url = `https://wttr.in/${city.toLowerCase()}?format=%C+%t`
        const response = await axios.get(url,{responseType:'text'})
        console.log(response.data)
        return `The Weather of ${city} is ${response.data}`
    }
})


const sendEmailTool = tool({
  name: "send_email",
  description: "Send an email to the user.",
  parameters: z.object({
    to: z.string().describe("Recipient email address"),
    subject: z.string().describe("Subject of the email"),
    html: z.string().describe("HTML body of the email"),
  }),
  needsApproval:true,
  execute: async ({ to, subject, html }) => {
    const transporter = nodemailer.createTransport({
      service: "gmail", // or smtp host
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // Gmail App Password
      },
    });

    const info = await transporter.sendMail({
      from: `"AI Weather Agent" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });

    return {
      success: true,
      messageId: info.messageId,
      response: info.response,
    };
  },
});

const agent = new Agent({
    name:"Weather Email Agent",
    instructions:"You are an expert agent in getting weather information and sending it using email to the user.",
    tools:[getWeatherTool,sendEmailTool],  
})

async function askForUserConfirmation(q:string){
    const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  const answer = await rl.question(`${q} (y/n): `);
  const normalizedAnswer = answer.toLowerCase();
  rl.close();
  return normalizedAnswer === 'y' || normalizedAnswer === 'yes';

}

async function main(q:string) {
    let result = await run(agent,q)
    // console.log(result.finalOutput)
    let hasInterruptions = result.interruptions.length > 0
    while (hasInterruptions) {
        const currentState = result.state;
        for (const interrupt of result.interruptions) {
            if(interrupt.type === 'tool_approval_item'){
            const isAllowed =  await askForUserConfirmation(
                `Agent ${interrupt.agent.name} is asking for calling tool ${interrupt.rawItem.name} with args ${interrupt.rawItem.arguments}`
            )
            if(isAllowed){
                currentState.approve(interrupt)
            }else{
                currentState.reject(interrupt)
            }
             result = await run(agent,currentState)
             hasInterruptions = result.interruptions?.length > 0
        }
    }
    }
}


main("what is the weather of Kuala Lumpur and  geroge town and send me on besoner360@bora4d.com")