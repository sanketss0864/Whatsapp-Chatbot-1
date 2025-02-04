import "./App.css";
import Chat from "./Components/chatbot";
import UnassignedSession from "./Components/UnassigendSession";
import { Route, Routes } from "react-router-dom";
import { useEffect,useState } from "react";
function App() {

  const [sessions, setSessions] = useState([]);
  const [count, setCount] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCount((prevCount) => prevCount + 1);
    }, 5000); 

    return () => clearInterval(interval);
  }, []);
  useEffect(() => {
    const fetchSessions = async () => {
      window.Xrm.WebApi.retrieveMultipleRecords(
        "bt_session",
        `?$select=bt_sessionid&$expand=bt_conversationid($select=bt_name)&$filter=(statuscode eq 1 )`
      ).then(
        function success(result) {
          const sessionData = result.entities.map((entity) => ({
            sessionid: entity.bt_sessionid,
            name: entity.bt_conversationid.bt_name,
          }));
          setSessions(sessionData);
        },
        function (error) {
          console.log(error.message);
        }
      );
    };

    fetchSessions();
  }, [count]);

  useEffect(()=>{
     if(sessions.length>0){
      window.Xrm.App.sidePanes.getSelectedPane().badge = sessions.length;
      console.log(sessions.length,"in")
     }

  },[sessions])
  return (
    <>
      <Routes>
        <Route
          path="/"
          element={
            <UnassignedSession onAccept={(session) => console.log(session)} />
          }
        />
        <Route path="/chat" element={<Chat />} />
      </Routes>
    </>
  );
}

export default App;
