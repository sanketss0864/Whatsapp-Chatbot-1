/* eslint-disable react/prop-types */
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";
import { Link } from "@fluentui/react-components";

import {
  DocumentArrowDown24Regular,
  DocumentPdf24Filled,
} from "@fluentui/react-icons";

function MediaController({ msg }) {
  return (
    <>
      {msg.mediaUrl && (
        <div className="media-response">
          {msg.filetype.includes("jpeg") && (
            <Zoom>
              <img
                className="media_section"
                src={`data:image/jpeg;base64,${msg.mediaUrl}`}
                alt="Media"
              />
            </Zoom>
          )}
          {msg.filetype.includes("mp4") && (
            <video
              className="media_section"
              controls
              src={`data:video/${msg.filetype.replace(".", "")};base64,${
                msg.mediaUrl
              }`}
              type={`video/${msg.filetype.replace(".", "")}`}
            />
          )}
          {msg.filetype.includes("pdf") && (
            <div>
              <Link
                href={`data:${msg.filetype};base64,${msg.mediaUrl}`}
                download={`file${msg.filetype}`}
                appearance="subtle"
              >
                <DocumentPdf24Filled />
                <span>file{msg.filetype}</span>
              </Link>
            </div>
          )}
          {msg.filetype.includes("ogg") && (
            <audio className="media_section_audio" controls>
              <source
                src={`data:audio/${msg.filetype.replace(".", "")};base64,${
                  msg.mediaUrl
                }`}
                type={`audio/${msg.filetype.replace(".", "")}`}
              />
              Your browser does not support the audio element.
            </audio>
          )}

          {!(
            msg.filetype.includes("jpeg") ||
            msg.filetype.includes("mp4") ||
            msg.filetype.includes("pdf") ||
            msg.filetype.includes("ogg")
          ) && (
            <div className="unsupported-file">
              <Link
                href={`data:${msg.filetype};base64,${msg.mediaUrl}`}
                download={`file${msg.filetype}`}
                appearance="subtle"
              >
                <DocumentArrowDown24Regular />
                <span>file{msg.filetype}</span>
              </Link>
            </div>
          )}
        </div>
      )}
    </>
  );
}

export default MediaController;
