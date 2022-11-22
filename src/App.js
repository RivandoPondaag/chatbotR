import { useState, useEffect } from "react";
import logobot from "./bot.png";
import logouser from "./user.png";
import "./App.css";
import {
  build_dictionary,
  clean_input,
  response_user,
  response_bot,
  get_time,
} from "./functions.js";
import $, { get } from "jquery";
import Header from "./components/Header.jsx";

// get data
const brain = require("brain.js");
const trainingPhrases = require("./data/data-patterns.json");
const data_responses = require("./data/data-responses.json");

// build dictionary
const dictionary = build_dictionary(trainingPhrases);
//console.log(dictionary); // print dictionary
console.log("Input: Semmy Wellem Taju"); // test encoding text input
console.log("Encoded: " + encode("Semmy Wellem Taju")); // test encoding text input

// prepare your training data
const trainingSet = trainingPhrases.map((dataSet) => {
  const encodedValue = encode(dataSet.phrase);
  return { input: encodedValue, output: dataSet.result };
});

// train neural network
const model_network = new brain.NeuralNetwork();
model_network.train(trainingSet);

// encoding text to number format
function encode(phrase) {
  const phraseTokens = phrase.split(" ");
  const encodedPhrase = dictionary.map((word) =>
    phraseTokens.includes(word) ? 1 : 0
  );

  return encodedPhrase;
}

// component function
function App() {
  // make a prediction
  function predict_bot(txt_chat_input) {
    // encode input text
    const encoded = encode(clean_input(txt_chat_input));
    // predict the response
    const json_output = model_network.run(encoded);
    console.log(
      "Max Categories: " + Object.values(json_output).length + " intents."
    );
    console.log(json_output);
    // get max value using apply
    const max = Math.max.apply(null, Object.values(json_output));
    const index = Object.values(json_output).indexOf(max);
    // get probability and pred_label
    const pred_label = Object.keys(json_output)[index];
    const pred_prob = json_output["" + pred_label];
    var pred_response = "";
    for (var no in data_responses) {
      if (data_responses[no]["" + pred_label] != null) {
        pred_response = data_responses[no]["" + pred_label];
      }
    }
    console.log(
      "Predicted label (" + pred_label + "), probability (" + pred_prob + ")."
    );
    return [pred_response, pred_prob];
  }

  // compile/execute chatbot
  const [input_chat, setInput_chat] = useState("");
  function run_chatbot() {
    // var input_chat = $('#input-chat').val(); // get input chat
    if (input_chat.length === 0) {
      alert("Sorry, write your text chat first.");
    } else if (input_chat.length > 1) {
      console.log("response_user", input_chat);
      // $("#content-chat-feed").append(response_user(input_chat, get_time(new Date)));
      force_scroll_bottom();

      // predict response chatbot
      const [respond_bot, prob_bot] = predict_bot(input_chat);
      const prob_val = (parseFloat(prob_bot) * 100).toFixed(2);

      console.log("Response: " + respond_bot);

      const threshold = 75;
      if (prob_val > threshold) {
        setChats([
          ...chats,
          {
            typ: false,
            msg: input_chat,
            prb: null,
            tim: get_time(new Date()),
          },
          {
            typ: true,
            msg: respond_bot,
            prb: prob_val,
            tim: get_time(new Date()),
          },
        ]);
        // $("#content-chat-feed").append(response_bot(respond_bot, prob_val, get_time(new Date)));
      } else {
        setChats([
          ...chats,
          {
            typ: false,
            msg: input_chat,
            prb: null,
            tim: get_time(new Date()),
          },
          {
            typ: true,
            msg: "Maaf, saya masih bodoh. Saya belum mengerti.",
            prb: prob_val,
            tim: get_time(new Date()),
          },
        ]);
        // $("#content-chat-feed").append(response_bot("Maaf, saya masih bodoh. Saya belum mengerti.", prob_val, get_time(new Date)));
      }
      // scroll bottom
      force_scroll_bottom();
      // set empty input
      // $('#input-chat').val('');
      setInput_chat("");
    }
	else if(input_chat === input_chat)
	{
		
	}
  }

  // Force scrollbar to bottom
  function force_scroll_bottom() {
    const el = document.getElementById("content-chat-feed");
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }

  // handle button function
  const handleButtonSend = () => {
    // compile chatbot brain.js
    run_chatbot();
  };

  // pressing Enter key
  const _handleKeyDown = (e) => {
    if (e.key === "Enter") {
      // compile chatbot brain.js
      run_chatbot();
    }
  };

  const [chats, setChats] = useState([
    {
      typ: true,
      msg: "Hi, selamat datang :)",
      prb: "98.99%",
      tim: "11:00 PM",
    },
  ]);

  useEffect(() => {
    console.log(`chats`, chats);
  }, [chats]);

  const containerbot = ({ typ, msg, prb, tim }) => {
    console.log(`typ = ${typ} | msg = ${msg} | prb = ${prb} | tim = ${tim}`);
    return (
      <div className={typ ? "containerbot" : "containerbot darker"}>
        <img
          src={typ ? logobot : logouser}
          alt="Avatar"
          style={{ width: "100%" }}
          className={typ ? "" : "right"}
        />
        <div className="row">
          <div className={typ ? "col-sm-8 pt-4" : "col-sm-2"}>
            {typ ? msg : <span className="time-left">{tim}</span>}
          </div>
          <div className={typ ? "col-sm-4 pt-4" : "col-sm-10 text-end"}>
            {typ ? (
              <span className="time-right">
                {prb}
                <br />
                {tim}
              </span>
            ) : (
              msg
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="App">
      <div className="card d-flex flex-column vh-100 overflow-hidden">
        <Header />
        <div
          className="card-body"
          style={{ overflowY: "scroll" }}
          id="content-chat-feed"
        >
          {chats.map((obj) => containerbot(obj))}
        </div>
        <div className="card-footer">
          <div className="input-group">
            <input
              type="text"
              className="form-control"
              id="input-chat"
              onKeyDown={_handleKeyDown}
              value={input_chat}
              onChange={(e) => setInput_chat(e.target.value)}
            />
            <div className="input-group-append">
              <button
                className="btn btn-primary"
                type="button"
                onClick={handleButtonSend}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
