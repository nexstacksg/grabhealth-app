import FormData from "form-data"; // form-data v4.0.1
import Mailgun from "mailgun.js"; // mailgun.js v11.1.0

async function sendSimpleMessage() {
const mailgun = new Mailgun(FormData);
const mg = mailgun.client({
username: "api",
key: process.env.MAIL_GUN_API_KEY || "API_KEY",
// When you have an EU-domain, you must specify the endpoint:
// url: "https://api.eu.mailgun.net"
});
try {
const data = await mg.messages.create("sandboxe37c8d502cf24fd692d4581b30f429cb.mailgun.org", {
from: "Mailgun Sandbox <postmaster@sandboxe37c8d502cf24fd692d4581b30f429cb.mailgun.org>",
to: ["Ken ling <ken@nexstack.sg>"],
subject: "Hello Ken ling",
text: "Congratulations Ken ling, you just sent an email with Mailgun! You are truly awesome!",
});

    console.log(data); // logs response data

} catch (error) {
console.log(error); //logs any error
}
}
