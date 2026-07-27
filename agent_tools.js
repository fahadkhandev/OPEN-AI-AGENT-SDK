import 'dotenv/config'
import { Agent,run,tool } from '@openai/agents'
import z from 'zod'


const getWeatherResultSchema = z.object({
    city: z.string().describe('name of the city'),
    degree: z.number().describe('degree Celsius of the city'),
    condition : z.string().optional().describe('weather condition of the city')
})

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

const sendEmail = tool({
    name: 'send_email',
    description: 'send email to the given email address.',
    parameters: z.object({
        email: z.string().email().describe('email address of the recipient'),
        subject: z.string().describe('subject of the email'),
        body: z.string().describe('body of the email')
    }),
    execute: async function({email,subject,body}) {
        console.log(`Sending email to ${email} with subject ${subject} and body ${body}`)
        return `Email sent to ${email} with subject ${subject} and body ${body}`
    }
})

const agent = new Agent({
    name:'Weather Agent',
    instructions: 'You are an expert weather agent that helps user to tell weather reports.',
    tools:[getWeatherTool],
    outputType: getWeatherResultSchema
})

async function main(query = ''){
    const result = await run(agent, query)
    console.log(`Result: `, result.finalOutput)
}

main('What is the weather of peshawar ')