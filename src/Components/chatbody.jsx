/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
/* eslint-disable no-undef */
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Dialog, DialogTrigger, DialogSurface, DialogBody, DialogTitle, DialogContent, DialogActions, Spinner } from "@fluentui/react-components";

// Register the required components with Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

import {
  Button,
  Menu,
  MenuTrigger,
  MenuPopover,
  MenuItem,
  MenuList,
  Link,
} from "@fluentui/react-components";

import {
  ChevronDown12Filled,
  DocumentArrowDown24Regular,
  DocumentPdf24Filled,
  ArrowDownload24Regular,
  MailAdd24Regular,
  CallAdd24Regular,
  ClipboardTaskAdd24Regular,
  NoteAdd24Regular,
  Accessibility24Regular,
} from "@fluentui/react-icons";
import MediaController from "./mediacontroller";

function Chatbody({ messages, sessionname, phoneno }) {
  const chatEndRef = useRef(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [sentimentData, setSentimentData] = useState(null);
  const [loading, setLoading] = useState(false);

  const createRecord = (tablename, msgtext, chatid) => {
    var entityFormOptions = {};
    entityFormOptions["entityName"] = tablename;

    var formParameters = {};

    if (tablename == "account") {
      formParameters.name = sessionname;
      formParameters.telephone1 = phoneno;
    }
    if (tablename == "contact") {
      formParameters.lastname = sessionname;
      formParameters.telephone1 = phoneno;
    }
    if (tablename == "phonecall") {
      formParameters.phonenumber = phoneno;
      formParameters.subject = msgtext;
    }
    if (tablename == "appointment") {
      formParameters.subject = msgtext;
      formParameters["regardingobjectid_bt_chat_appointment@odata.bind"] =
        "/bt_chats(" + chatid + ")";
    }
    if (tablename == "email") {
      formParameters.subject = msgtext;
      formParameters["regardingobjectid_bt_chat_appointment@odata.bind"] =
        "/bt_chats(" + chatid + ")";
    }

    window.Xrm.Navigation.openForm(entityFormOptions, formParameters).then(
      function (success) {},
      function (error) {
        console.log(error);
      }
    );
  };
  const createTask = (msg, chatid) => {
    var entityFormOptions = {};
    entityFormOptions["entityName"] = "task";

    var formParameters = {};
    formParameters[
      "regardingobjectid_bt_chat_task@odata.bind"
    ] = `/bt_chats(${chatid})`;
    formParameters.subject = msg;

    window.Xrm.Navigation.openForm(entityFormOptions, formParameters).then(
      function (success) {},
      function (error) {
        console.log(error);
      }
    );
  };

  function sentimentAnalysis(msgtext, chatid) {
    const url = "https://prod-31.centralindia.logic.azure.com:443/workflows/3c1e80b1d3574d08bea3c56667e1f28d/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=rUxBYG2WLr4lKQddFU4R1i6zTxhZ2N3V5q6TqgG4zJY";
    const data = {
      "text": msgtext,
      "chatId": chatid
    };

    setLoading(true);
    fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then((data) => {
        setSentimentData(data);
        setLoading(false);
        setModalOpen(true);
      })
      .catch((error) => {
        console.error("Error:", error);
        setLoading(false);
      });
  }

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const chartData = sentimentData && {
    labels: ["Negative", "Neutral", "Positive"],
    datasets: [
      {
        label: "Sentiment Probability",
        data: [
          sentimentData[0].probabilityNegative,
          sentimentData[0].probabilityNeutral,
          sentimentData[0].probabilityPositive,
        ],
        backgroundColor: ["#ff6384", "#ffcd56", "#4bc0c0"],
      },
    ],
  };

  return (
    <>
      {/* Chat Body */}
      <div className="chat-body">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`chat-message ${
              msg?.type === "user" ? "chat-query" : "chat-response"
            }`}
          >
            <div
              className={`chat-bubble ${
                msg?.type === "user"
                  ? "chat-query-bubble"
                  : "chat-response-bubble"
              }`}
            >
              <Menu>
                <MenuTrigger disableButtonEnhancement>
                  <Button icon={<ChevronDown12Filled />} className="context" />
                </MenuTrigger>
                <MenuPopover>
                  <MenuList>
                    {msg.text && (
                      <MenuItem
                        icon={<NoteAdd24Regular />}
                        onClick={() => createTask(msg?.text, msg?.chatid)}
                      >
                        Create Task
                      </MenuItem>
                    )}

                    <MenuItem
                      icon={<CallAdd24Regular />}
                      onClick={() =>
                        createRecord("phonecall", msg?.text, msg?.chatid)
                      }
                    >
                      Create phone call
                    </MenuItem>
                    <MenuItem
                      icon={<ClipboardTaskAdd24Regular />}
                      onClick={() =>
                        createRecord("appointment", msg?.text, msg?.chatid)
                      }
                    >
                      Create appoinment
                    </MenuItem>
                    <MenuItem
                      icon={<MailAdd24Regular />}
                      onClick={() =>
                        createRecord("email", msg?.text, msg?.chatid)
                      }
                    >
                      Create send email
                    </MenuItem>
                    {msg.text && (  <MenuItem
                      icon={<Accessibility24Regular />}
                      onClick={() =>
                        sentimentAnalysis(msg?.text, msg?.chatid)
                      }
                    >
                       sentiment analysis
                    </MenuItem>)}
                  
                    {msg.mediaUrl && (
                      <Link
                        href={`data:${msg.filetype};base64,${msg.mediaUrl}`}
                        download={`file${msg.filetype}`}
                        appearance="subtle"
                      >
                        <MenuItem icon={<ArrowDownload24Regular />}>
                          Download File
                        </MenuItem>
                      </Link>
                    )}
                  </MenuList>
                </MenuPopover>
              </Menu>

              {/* Display media if available */}
              <MediaController msg={msg}></MediaController>

              <ReactMarkdown>{msg.text}</ReactMarkdown>
              <div
                className="timestamp"
                style={{ display: "flex", gap: "10px", alignItems: "center" }}
              >
                {msg?.createdon}
                {msg.type == "chat-query" ? (
                  ""
                ) : msg?.messagesStatus == "1" ? (
                  <i
                    style={{ color: "#2ddcff", fontSize: "17px" }}
                    className="ti ti-checks"
                  ></i>
                ) : msg?.messagesStatus == "121300001" ? (
                  <i className="ti ti-check" style={{ fontSize: "17px" }}></i>
                ) : msg?.messagesStatus == "121300002" ? (
                  <i className="ti ti-checks" style={{ fontSize: "17px" }}></i>
                ) : (
                  ""
                )}
              </div>
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      <Dialog
        open={modalOpen}
        onDismiss={() => setModalOpen(false)}
      >
        <DialogSurface>
          <DialogBody>
            <DialogTitle>Sentiment Analysis Result</DialogTitle>
            <DialogContent>
              {loading ? (
                <Spinner label="Loading..." />
              ) : (
                sentimentData && <Bar data={chartData} />
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setModalOpen(false)}>Close</Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    </>
  );
}

export default Chatbody;
