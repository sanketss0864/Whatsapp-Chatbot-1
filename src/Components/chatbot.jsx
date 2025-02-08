/* eslint-disable no-debugger */
/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
import { useState, useRef, useEffect } from "react";
import { Dialog, DialogTrigger, DialogSurface, DialogBody, DialogTitle, DialogContent, DialogActions, Spinner } from "@fluentui/react-components";
import { Avatar, Tooltip } from "@fluentui/react-components";
import "react-perfect-scrollbar/dist/css/styles.css";
import Chatbody from "./chatbody";

import {
  Input,
  Button,
  Menu,
  MenuTrigger,
  MenuPopover,
  MenuItem,
  MenuList,
  Link,
  Textarea,
} from "@fluentui/react-components";
import {
  ArrowLeft20Filled,
  MoreHorizontal24Filled,
  Send20Regular,
  ChevronDown12Filled,
  DocumentPdfRegular,
  DocumentArrowDownRegular,
  DocumentPdf32Regular,
  DocumentArrowDown24Regular,
  DocumentPdf24Filled,
  TextAlignJustify24Regular,
  PersonArrowRightFilled,
  PersonArrowRight24Filled,
  CommentDismiss24Regular,
  PersonDelete24Regular,
  PersonAdd24Regular,
  Open24Regular,
  AlbumAdd24Regular,
  PersonSupport24Regular,
  PersonCall24Regular,
  ArrowDownload24Regular,
  MailAdd24Regular,
  CallAdd24Regular,
  ClipboardTaskAdd24Regular,
  NoteAdd24Regular,
  Album24Regular,
} from "@fluentui/react-icons";
import { useLocation, useNavigate } from "react-router-dom";
import "./Chat.css";

import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";

const Chat = () => {
  const textAreaRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const sessionid = location.state?.sessionid;
  const sessionname = location.state?.sessionname;
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [isSending, setIsSending] = useState(false);
  const [phoneno, setphoneno] = useState("");

  const [chatstatus, setChatStatus] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [sentimentData, setSentimentData] = useState(null);
  const [loading, setLoading] = useState(false);


  useEffect(() => {
    fetchAllMessages(sessionid);
  }, [sessionid]);
  useEffect(() => {
    Xrm.WebApi.retrieveMultipleRecords(
      "bt_chat",
      "?$select=bt_name&$filter=bt_direction eq 1&$top=1"
    ).then(
      function success(results) {
        setphoneno(results.entities[0].bt_name.replace(/whatsapp:/, ""));
      },
      function (error) {
        console.log(error.message);
      }
    );
  }, []);

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };
  const handleSend = () => {
    if (input.trim() && !isSending) {
      setIsSending(true);
      const formattedTime = () =>
        new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        });
      const userMessage = {
        text: input,
        type: "user",
        createdon: formattedTime(),
      };
      setMessages((prevMessages) => [...prevMessages, userMessage]);
      setInput("");

      setTimeout(() => {
        handleAgentChat(userMessage.text);
        setIsSending(false);
      }, 1000);
    }
  };
  useEffect(() => {
    assignSessionToUser(sessionid);
  }, []);
  const assignSessionToUser = (sessionid) => {
    var record = {};
    record.statuscode = 121300001;

    window.Xrm.WebApi.updateRecord("bt_session", sessionid, record).then(
      function success(result) {
        var updatedId = result.id;
      },
      function (error) {
        console.log(error.message);
      }
    );

    return new Promise((resolve, reject) => {
      const context = window.Xrm.Utility.getGlobalContext();
      var record = {};
      record["ownerid@odata.bind"] = `/systemusers(${context.userSettings.userId
        .replace("{", "")
        .replace("}", "")})`;

      parent.Xrm.WebApi.updateRecord("bt_session", sessionid, record).then(
        function success(result) {
          var userId = result.id;

          resolve(userId);
        },
        function (error) {
          console.log(error.message);
          reject(error);
        }
      );
    });
  };

  const postMessage = (sessionid, message) => {
    const context = window.Xrm.Utility.getGlobalContext();

    var serverURL = context.getClientUrl();

    var actionName = "bt_WhatsappChatbotActionv1";
    var data = {
      sessionid: sessionid,
      message: message,
    };

    var req = new XMLHttpRequest();
    req.open("POST", serverURL + "/api/data/v9.2/" + actionName, true);
    req.setRequestHeader("Accept", "application/json");
    req.setRequestHeader("Content-Type", "application/json; charset=utf-8");
    req.setRequestHeader("OData-MaxVersion", "4.0");
    req.setRequestHeader("OData-Version", "4.0");

    req.onreadystatechange = function () {
      if (this.readyState == 4) {
        req.onreadystatechange = null;

        if (this.status == 200 || this.status == 204) {
          fetchMessages(sessionid);
          setIsSending(false);
          setChatStatus(true);

          if (textAreaRef.current) {
            textAreaRef.current.focus();
          }
        } else {
          var error = JSON.parse(this.response).error;
        }
      }
    };

    req.send(window.JSON.stringify(data));
  };

  const fetchMessages = (sessionid) => {
    window.Xrm.WebApi.retrieveMultipleRecords(
      "bt_chat",
      "?$select=bt_chatid,bt_message,bt_filetype,bt_name,createdon&$filter=(statuscode eq 121300001 and _bt_session_value eq " +
        sessionid +
        " and bt_direction eq 1)&$orderby=createdon asc"
    ).then(
      function success(results) {
        const newMessages = results.entities.map((msg) => ({
          text: msg.bt_message,
          type: msg.bt_direction === 2 ? "user" : "chat-query",
          chatid: msg.bt_chatid,
          createdon: new Date(`${msg.createdon}`).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          }),
          hasMedia: false,
          mediaUrl: null,
          filetype: msg.bt_filetype,
        }));

        if (results.entities.length > 0) {
          setMessages((prevMessages) => [...prevMessages, ...newMessages]);
        }

        results.entities.forEach((result) => {
          setReadStatus(sessionid, result["bt_chatid"]);
          fetchMedia(result["bt_chatid"], result["bt_message"]);
        });
      },
      function (error) {
        console.log(error.message);
      }
    );
  };

  const fetchAllMessages = (sessionid) => {
    window.Xrm.WebApi.retrieveMultipleRecords(
      "bt_chat",
      "?$select=bt_direction,bt_message,bt_chatid,bt_filetype,createdon,statuscode&$filter=_bt_session_value eq " +
        sessionid
    ).then(
      function success(results) {
        const newMessages = results.entities.map((msg) => ({
          text: msg.bt_message,
          type: msg.bt_direction === 2 ? "user" : "chat-query",
          chatid: msg.bt_chatid,
          createdon: new Date(`${msg.createdon}`).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          }),
          hasMedia: false,
          mediaUrl: null,
          filetype: msg.bt_filetype,
          messagesStatus: msg.statuscode,
        }));

        setMessages([...newMessages]);

        results.entities.forEach((msg) => {
          if (msg.bt_direction === 1) {
            setReadStatus(sessionid, msg["bt_chatid"]);
          }
          fetchMedia(msg["bt_chatid"], msg["bt_message"]);
        });
      },
      function (error) {
        console.log(error.message);
      }
    );
  };

  const setReadStatus = (sessionid, chatid) => {
    var record = {};
    record.statuscode = 1;

    window.Xrm.WebApi.updateRecord("bt_chat", chatid, record).then(
      function success(result) {
        var updatedId = result.id;
      },
      function (error) {
        console.log(error.message);
      }
    );
  };
  const fetchMedia = (chatid, messageText) => {
    window.Xrm.WebApi.retrieveMultipleRecords(
      "annotation",
      "?$filter=_objectid_value eq " + chatid
    ).then(
      function success(results) {
        if (results.entities.length > 0) {
          const mediaUrl = results.entities[0].documentbody;
          setMessages((prevMessages) =>
            prevMessages.map((msg) =>
              msg.chatid === chatid ? { ...msg, hasMedia: true, mediaUrl } : msg
            )
          );
        }
      },
      function (error) {
        console.log(error.message);
      }
    );
  };
  const handleAgentChat = (message) => {
    setIsSending(true);

    if (!chatstatus) {
      assignSessionToUser(sessionid).then(() => {
        setIsSending(false);
      });
    }
    postMessage(sessionid, message);
  };

  function openSession(sessionid) {
    var entityFormOptions = {};
    entityFormOptions["entityName"] = "bt_session";
    entityFormOptions["entityId"] = sessionid;

    window.Xrm.Navigation.openForm(entityFormOptions).then(
      function (success) {},
      function (error) {
        console.log(error);
      }
    );
  }

  const handleCloseSession = () => {
    var record = {};
    record.statuscode = 121300002;

    window.Xrm.WebApi.updateRecord("bt_session", sessionid, record).then(
      function success(result) {
        var updatedId = result.id;

        navigate("/");
      },
      function (error) {
        console.log(error.message);
      }
    );
  };

  useEffect(() => {
    let intervalId;
    if (sessionid) {
      intervalId = setInterval(() => {
        fetchMessages(sessionid);
      }, 1000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [sessionid]);

  const goToSessionList = () => {
    navigate("/");
  };

  const modifySessionUser = () => {
    var lookupOptions = {
      defaultEntityType: "systemuser",
      entityTypes: ["systemuser"],
      allowMultiSelect: false,
    };

    window.Xrm.Utility.lookupObjects(lookupOptions).then(
      function (success) {
        var record = {};
        record["ownerid@odata.bind"] = `/systemusers(${success[0].id
          .replace("{", "")
          .replace("}", "")})`;

        window.Xrm.WebApi.updateRecord("bt_session", sessionid, record).then(
          function success(result) {
            var userId = result.id;
            const context = window.Xrm.Utility.getGlobalContext();
            var record = {};
            record[
              "bt_assignedby@odata.bind"
            ] = `/systemusers(${context.userSettings.userId
              .replace("{", "")
              .replace("}", "")})`;
            record.statuscode = 121300003;

            window.Xrm.WebApi.updateRecord(
              "bt_session",
              sessionid,
              record
            ).then(
              function success(result) {
                var updatedId = result.id;
                navigate("/");
              },
              function (error) {
                console.log(error.message);
              }
            );
          },
          function (error) {}
        );
      },
      function (error) {
        console.log(error);
      }
    );
  };

  const createRecord = (tablename, msgtext, chatid) => {
    var entityFormOptions = {};
    entityFormOptions["entityName"] = tablename;

    var formParameters = {};

    if (tablename == "account") {
      formParameters.name = sessionname; // Text
      formParameters.telephone1 = phoneno; // Text
    }
    if (tablename == "contact") {
      formParameters.lastname = sessionname;
      formParameters.telephone1 = phoneno;
    }
    if (tablename == "phonecall") {
      formParameters.phonenumber = phoneno; // Text
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
      function (success) {
        console.log(success);
      },
      function (error) {
        console.log(error);
      }
    );
  };


  const openConversation = () => {
    Xrm.WebApi.retrieveMultipleRecords(
      "bt_session",
      `?$select=_bt_conversationid_value&$filter=bt_sessionid eq ${sessionid}`
    ).then(
      function success(results) {
        console.log(results.entities[0]._bt_conversationid_value);
        Xrm.Utility.openEntityForm(
          "bt_conversation",
          results.entities[0]._bt_conversationid_value
        );
      },
      function (error) {
        console.log(error.message);
      }
    );
  };

  return (
    <div className="chat-container">
      {/* Top Bar with Back and Menu */}
      <div className="chat-header">
        <div className="chat-avatar-cont">
          <ArrowLeft20Filled
            className="back-button"
            onClick={() => navigate("/")}
          />

          <div
            style={{ display: "flex", alignItems: "center", gap: "10px" }}
            onClick={openConversation}
          >
            <Avatar color="colorful" name={sessionname} />
            <div>{sessionname}</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <Tooltip content="Transfer Session">
            <PersonArrowRight24Filled onClick={() => modifySessionUser()} />
          </Tooltip>

          <Menu>
            <MenuTrigger disableButtonEnhancement>
              <Button
                icon={<TextAlignJustify24Regular />}
                appearance="primary"
              />
            </MenuTrigger>
            <MenuPopover>
              <MenuList>
                {/* <MenuItem onClick={() => fetchAllMessages(sessionid)}>Retrieve Chats</MenuItem> */}
                <MenuItem
                  icon={<PersonDelete24Regular />}
                  onClick={() => handleCloseSession(sessionid)}
                >
                  Close Session
                </MenuItem>
                <MenuItem
                  icon={<Open24Regular />}
                  onClick={() => openSession(sessionid)}
                >
                  Open Session
                </MenuItem>
                <MenuItem
                  icon={<PersonAdd24Regular />}
                  onClick={() => createRecord("account")}
                >
                  Create Account
                </MenuItem>
                <MenuItem
                  icon={<AlbumAdd24Regular />}
                  onClick={() => createRecord("contact")}
                >
                  Create Contact
                </MenuItem>
                <MenuItem
                  icon={<PersonCall24Regular />}
                  onClick={() => createRecord("lead")}
                >
                  Create lead
                </MenuItem>
                <MenuItem
                  icon={<PersonSupport24Regular />}
                  onClick={() => createRecord("incident")}
                >
                  Create case
                </MenuItem>
              
              </MenuList>
            </MenuPopover>
          </Menu>
        </div>
      </div>

      {/* Chat Body Section */}
      <Chatbody
        messages={messages}
        sessionname={sessionname}
        phoneno={phoneno}
      ></Chatbody>

      {/* Chat Input Section */}
      <div className="chat-input-section">
        <Textarea
          size="small"
          style={{}}
          value={input}
          onChange={handleInputChange}
          placeholder="Type a message..."
          disabled={isSending}
          className="chat-input"
          componentRef={textAreaRef}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSend();
          }}
        />
        <Button
          icon={<Send20Regular />}
          onClick={handleSend}
          disabled={isSending}
          appearance="primary"
          className="send-button"
        >
          Send
        </Button>
      </div>



        
    </div>
  );
};

export default Chat;
