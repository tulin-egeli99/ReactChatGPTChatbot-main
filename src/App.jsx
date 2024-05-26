import { useState } from 'react'
import './App.css'
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import { MainContainer, ChatContainer, MessageList, Message, MessageInput, TypingIndicator } from '@chatscope/chat-ui-kit-react';



 const API_KEY = "Apı key";
//"Bir şeyleri, kodlama öğrenen 10 yaşındaki bir çocuğa açıklar gibi açıkla."
const systemMessage = { // "Bir şeyleri, 5 yıllık deneyime sahip bir yazılım profesyoneliyle konuşuyormuş gibi açıkla."
  "role": "system", "content": "Explain things like you're talking to a software professional with 2 years of experience."
}

function App() {
  const [messages, setMessages] = useState([
    {
      message: "Hello, I'm ChatGPT! Ask me anything!",
      sentTime: "just now",
      sender: "ChatGPT"
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = async (message) => {
    const newMessage = {
      message,
      direction: 'outgoing',
      sender: "user"
    };

    const newMessages = [...messages, newMessage];
    
    setMessages(newMessages);
// İlk sistem mesajı, ChatGPT'nin işlevselliğini belirlemek için kullanılır
// Nasıl yanıt verdiği, nasıl konuştuğu vb.

    setIsTyping(true);
    await processMessageToChatGPT(newMessages);
  };

  async function processMessageToChatGPT(chatMessages) { // messages is an array of messages
    
    // Mesajları ChatGPT API'si için formatla
    // API, { role: "user" veya "assistant", "content": "buraya mesaj" } formatında nesneler bekliyor
    // Bu yüzden yeniden formatlamamız gerekiyor
    

    let apiMessages = chatMessages.map((messageObject) => {
      let role = "";
      if (messageObject.sender === "ChatGPT") {
        role = "assistant";
      } else {
        role = "user";
      }
      return { role: role, content: messageObject.message}
    });


    
// Kullanmayı planladığımız model ile istek gövdesini ayarla
// ve yukarıda formatladığımız mesajları ekle. ChatGPT'nin nasıl davranmasını istediğimizi belirlemek için
// başa bir sistem mesajı ekliyoruz.

    const apiRequestBody = {
      "model": "gpt-3.5-turbo",
      "messages": [
        systemMessage, // Sistem mesajı, chatGPT'nin mantığını TANIMLAR
        ...apiMessages //ChatGPT ile sohbetimizden gelen mesajlar
      ]
    }

    await fetch("https://api.openai.com/v1/chat/completions", 
    {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(apiRequestBody)
    }).then((data) => {
      return data.json();
    }).then((data) => {
      console.log(data);
      setMessages([...chatMessages, {
        message: data.choices[0].message.content,
        sender: "ChatGPT"
      }]);
      setIsTyping(false);
    });
  }

  return (
    <div className="App">
      <div style={{ position:"relative", height: "800px", width: "700px"  }}>
        <MainContainer>
          <ChatContainer>       
            <MessageList 
              scrollBehavior="smooth" 
              typingIndicator={isTyping ? <TypingIndicator content="ChatGPT is typing" /> : null}
            >
              {messages.map((message, i) => {
                console.log(message)
                return <Message key={i} model={message} />
              })}
            </MessageList>
            <MessageInput placeholder="Type message here" onSend={handleSend} />        
          </ChatContainer>
        </MainContainer>
      </div>
    </div>
  )
}

export default App
