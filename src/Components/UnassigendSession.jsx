/* eslint-disable no-unused-vars */
/* eslint-disable react/no-unescaped-entities */
import PropTypes from "prop-types";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Stack,
  List,
  Text,
  PrimaryButton,
  DefaultButton,
  MessageBar,
  MessageBarType,
} from "@fluentui/react";
import { Title3 } from "@fluentui/react-components";
import "./Chat.css";

const UnassignedSession = ({ onAccept }) => {
  const [sessions, setSessions] = useState([]);
  const [openSession, setOpenSession] = useState([]);
  const [transferredSession, setTransferredSession] = useState([]);
  const [count, setCount] = useState(0);
  const [ownerid, setownerid] = useState("");

  const context = window.Xrm.Utility.getGlobalContext();

  useEffect(() => {
    const interval = setInterval(() => {
      setCount((prevCount) => prevCount + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSessions = async () => {
      const context = window.Xrm.Utility.getGlobalContext();
      window.Xrm.WebApi.retrieveMultipleRecords(
        "bt_session",
        `?$select=bt_sessionid&$expand=bt_conversationid($select=bt_name)&$filter=(statuscode eq 1 )`
      ).then(
        function success(result) {
          const sessionData = result.entities.map((entity) => ({
            sessionid: entity.bt_sessionid,
            name: entity.bt_conversationid.bt_name,
          }));
          // console.log(JSON.stringify(context.userSettings.userId));
          setSessions(sessionData);
        },
        function (error) {
          console.log(error.message);
          // handle error conditions
        }
      );
    };

    fetchSessions();
  }, [count]);

  useEffect(() => {
    const fetchOpenSessions = async () => {
      const context = window.Xrm.Utility.getGlobalContext();
      window.Xrm.WebApi.retrieveMultipleRecords(
        "bt_session",
        `?$select=bt_sessionid&$expand=bt_conversationid($select=bt_name)&$filter=(statuscode eq 121300001 and _ownerid_value eq ${context.userSettings.userId
          .replace("{", "")
          .replace("}", "")})`
      ).then(
        function success(result) {
          const openSessionData = result.entities.map((entity) => ({
            sessionid: entity.bt_sessionid,
            name: entity.bt_conversationid.bt_name,
          }));
          // console.log(JSON.stringify(context.userSettings.userId));
          setOpenSession(openSessionData);
        },
        function (error) {
          console.log(error.message);
          // handle error conditions
        }
      );
    };

    fetchOpenSessions();
  }, [count]);

  useEffect(() => {
    const fetchTransferredSessions = async () => {
      const context = window.Xrm.Utility.getGlobalContext();
      window.Xrm.WebApi.retrieveMultipleRecords(
        "bt_session",
        `?$select=bt_sessionid&$expand=bt_conversationid($select=bt_name)&$filter=(statuscode eq 121300003 and _ownerid_value eq ${context.userSettings.userId
          .replace("{", "")
          .replace("}", "")})`
      ).then(
        function success(result) {
          const transferredSessionData = result.entities.map((entity) => ({
            sessionid: entity.bt_sessionid,
            name: entity.bt_conversationid.bt_name,
          }));
          // console.log(JSON.stringify(context.userSettings.userId));

          setTransferredSession(transferredSessionData);
        },
        function (error) {
          console.log(error.message);
          // handle error conditions
        }
      );
    };

    fetchTransferredSessions();
  }, [count]);

  const handleAccept = (session) => {
    onAccept(session);
    navigate("/chat", {
      state: { sessionid: session.sessionid, sessionname: session.name },
    });
  };

  const handleSkip = (sessionid) => {
    setSessions(sessions.filter((session) => session.sessionid !== sessionid));
    setOpenSession(
      openSession.filter((session) => session.sessionid !== sessionid)
    );
  };

  const handleCloseSession = (sessionid) => {
    var record = {};
    record.statuscode = 121300002; // Status
    handleSkip(sessionid);
    window.Xrm.WebApi.updateRecord("bt_session", sessionid, record).then(
      function success(result) {
        var updatedId = result.id;
        // console.log(updatedId);
        navigate("/");
      },
      function (error) {
        console.log(error.message);
      }
    );
  };

  return sessions.length === 0 &&
    openSession.length === 0 &&
    transferredSession.length === 0 ? (
    <MessageBar messageBarType={MessageBarType.success}>
      🎉 You're all caught up! No open sessions at the moment. Take a breather,
      or start something new.
    </MessageBar>
  ) : (
    <Stack tokens={{ childrenGap: 20 }} className="session_div">
      {sessions.length > 0 ? (
        <Stack>
          <Title3
            variant="large"
            className="title"
            style={{
              background: "#005ea6",
              color: "white",
              padding: "2px 10px",
              fontSize: "18px",
            }}
          >
            Unassigned Sessions
          </Title3>
          <hr style={{ marginBottom: "20px" }} />
          <List
            style={{ padding: "0 10px" }}
            items={sessions}
            onRenderCell={(session) => (
              <Stack
                horizontal
                horizontalAlign="space-between"
                tokens={{ childrenGap: 10 }}
                className="session-item"
                styles={{ root: { marginBottom: "10px" } }}
              >
                <Text>{session.name}</Text>
                <Stack
                  horizontal
                  tokens={{ childrenGap: 5 }}
                  className="call_to_action"
                >
                  <PrimaryButton
                    text="Accept"
                    onClick={() => handleAccept(session)}
                  />
                  <DefaultButton
                    text="Skip"
                    onClick={() => handleSkip(session.sessionid)}
                  />
                </Stack>
              </Stack>
            )}
          />
        </Stack>
      ) : (
        ""
      )}

      {openSession.length > 0 ? (
        <Stack>
          <Title3
            variant="large"
            className="title"
            style={{
              background: "#005ea6",
              color: "white",
              padding: "2px 10px",
              fontSize: "18px",
            }}
          >
            Open Sessions
          </Title3>
          <hr style={{ marginBottom: "20px" }} />
          <List
            style={{ padding: "0 10px" }}
            items={openSession}
            onRenderCell={(session) => (
              <Stack
                horizontal
                horizontalAlign="space-between"
                tokens={{ childrenGap: 10 }}
                className="session-item"
                styles={{ root: { marginBottom: "10px" } }}
              >
                <Text>{session.name}</Text>
                <Stack
                  horizontal
                  tokens={{ childrenGap: 5 }}
                  className="call_to_action"
                >
                  <PrimaryButton
                    text="Continue"
                    onClick={() => handleAccept(session)}
                  />
                  <DefaultButton
                    text="Close"
                    onClick={() => handleCloseSession(session.sessionid)}
                  />
                </Stack>
              </Stack>
            )}
          />
        </Stack>
      ) : (
        ""
      )}
      {transferredSession.length > 0 ? (
        <Stack>
          <Title3
            variant="large"
            className="title"
            style={{
              background: "#005ea6",
              color: "white",
              padding: "2px 10px",
              fontSize: "18px",
            }}
          >
            Transferred Sessions
          </Title3>
          <hr style={{ marginBottom: "20px" }} />
          <List
            style={{ padding: "0 10px" }}
            items={transferredSession}
            onRenderCell={(session) => (
              <Stack
                horizontal
                horizontalAlign="space-between"
                tokens={{ childrenGap: 10 }}
                className="session-item"
                styles={{ root: { marginBottom: "10px" } }}
              >
                <Text>{session.name}</Text>
                <Stack
                  horizontal
                  tokens={{ childrenGap: 5 }}
                  className="call_to_action"
                >
                  <PrimaryButton
                    text="Continue"
                    onClick={() => handleAccept(session)}
                  />
                  <DefaultButton
                    text="Close"
                    onClick={() => handleCloseSession(session.sessionid)}
                  />
                </Stack>
              </Stack>
            )}
          />
        </Stack>
      ) : (
        ""
      )}
    </Stack>
  );
};

UnassignedSession.propTypes = {
  onAccept: PropTypes.func.isRequired,
};

export default UnassignedSession;
