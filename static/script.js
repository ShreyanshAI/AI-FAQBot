// ======================================
// FAQBot AI
// Premium Chat Script
// ======================================

const chatBox = document.getElementById("chatBox");
const input = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const questionButtons = document.querySelectorAll(".question-btn");

// ===============================
// Add User Message
// ===============================

function addUserMessage(message){

    const div = document.createElement("div");

    div.className = "user-message";

    div.innerHTML = message;

    chatBox.appendChild(div);

    chatBox.scrollTop = chatBox.scrollHeight;

}

// ===============================
// Add Bot Message
// ===============================

function addBotMessage(message){

    const div = document.createElement("div");

    div.className = "bot-message";

    div.innerHTML = message;

    chatBox.appendChild(div);

    chatBox.scrollTop = chatBox.scrollHeight;

}

// ===============================
// Typing Animation
// ===============================

function showTyping(){

    const typing = document.createElement("div");

    typing.className = "typing";

    typing.id = "typing";

    typing.innerHTML =

    `<span></span>
     <span></span>
     <span></span>`;

    chatBox.appendChild(typing);

    chatBox.scrollTop = chatBox.scrollHeight;

}

function removeTyping(){

    const typing = document.getElementById("typing");

    if(typing){

        typing.remove();

    }

}

// ===============================
// Send Message
// ===============================

async function sendMessage(){

    const message = input.value.trim();

    if(message==="") return;

    addUserMessage(message);

    input.value="";

    showTyping();

    try{

        const response = await fetch("/chat",{

            method:"POST",

            headers:{

                "Content-Type":"application/json"

            },

            body:JSON.stringify({

                message:message

            })

        });

        const data = await response.json();

        removeTyping();

        addBotMessage(data.answer);

    }

    catch(error){

        removeTyping();

        addBotMessage("⚠️ Server Error.");

    }

}
// ===============================
// Send Button
// ===============================

sendBtn.addEventListener("click", sendMessage);

// ===============================
// Enter Key Support
// ===============================

input.addEventListener("keypress", function(e){

    if(e.key==="Enter"){

        sendMessage();

    }

});

// ===============================
// Suggested Questions
// ===============================

questionButtons.forEach(button=>{

    button.addEventListener("click",()=>{

        input.value = button.innerText;

        sendMessage();

    });

});

// ===============================
// Welcome Message Delay
// ===============================

window.onload=()=>{

    setTimeout(()=>{

        addBotMessage("💡 Tip: Click a suggested question below or type your own question.");

    },1000);

};

// ===============================
// Auto Focus
// ===============================

input.focus();

// ===============================
// Prevent Empty Spaces
// ===============================

input.addEventListener("input",()=>{

    input.value=input.value.replace(/\s{2,}/g," ");

});
// ===============================
// Chat History (Browser)
// ===============================

let history = JSON.parse(localStorage.getItem("faqbot-history")) || [];

function saveHistory(question, answer){

    history.push({

        question,

        answer,

        time:new Date().toLocaleTimeString()

    });

    if(history.length>20){

        history.shift();

    }

    localStorage.setItem(

        "faqbot-history",

        JSON.stringify(history)

    );

}

// ===============================
// Override Bot Function
// ===============================

const oldBotMessage = addBotMessage;

addBotMessage = function(message){

    oldBotMessage(message);

    const userMessages =

    document.querySelectorAll(".user-message");

    const lastUser =

    userMessages[userMessages.length-1];

    if(lastUser){

        saveHistory(

            lastUser.innerText,

            message

        );

    }

};

// ===============================
// Smooth Auto Scroll
// ===============================

const observer = new MutationObserver(()=>{

    chatBox.scrollTo({

        top:chatBox.scrollHeight,

        behavior:"smooth"

    });

});

observer.observe(chatBox,{

    childList:true

});

// ===============================
// End
// ===============================

console.log("✅ FAQBot AI Loaded Successfully");
const clearBtn = document.getElementById("clearChatBtn");

clearBtn.addEventListener("click",()=>{

    chatBox.innerHTML=`

    <div class="bot-message">

    👋 Hello! I am FAQBot AI.<br><br>

    Ask me anything.

    </div>

    `;

    localStorage.removeItem("faqbot-history");

});