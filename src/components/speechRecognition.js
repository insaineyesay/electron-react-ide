import React, { useRef, useState } from "react";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
// import microPhoneIcon from "./microphone.svg";
import { classnames } from "../utils/general";

function SpeechRecognitionComponent({ onChange }) {
    const speechCommands = [
        {
            command: "open *",
            callback: (website) => {
                window.open("http://" + website.split(" ").join(""));
            },
        },
        {
            command: "change background colour to *",
            callback: (color) => {
                document.body.style.background = color;
            },
        },
        {
            command: "reset",
            callback: () => {
                handleReset();
            },
        },
        ,
        {
            command: "reset background colour",
            callback: () => {
                document.body.style.background = `rgba(0, 0, 0, 0.8)`;
            },
        },
    ];
    const defaultTranscript = "hello world";
    const [recordedTranscript, setRecordedValue] = useState(defaultTranscript || transcript);
    
    const handleTranscriptChange = (value) => {
        setRecordedValue(value);
        onChange("code", value);
    };

    const { transcript, resetTranscript } = useSpeechRecognition({ speechCommands });
    const [isListening, setIsListening] = useState(false);
    const microphoneRef = useRef(null);

    if (!SpeechRecognition.browserSupportsSpeechRecognition()) {
        return (
            <div className="mircophone-container">
                Browser is not Support Speech Recognition.
            </div>
        );
    }
    const handleListing = () => {
        setIsListening(true);
        // microphoneRef.current.classList.add("listening");
        SpeechRecognition.startListening({
            continuous: true,
        });
    };

    const stopHandle = () => {
        setIsListening(false);
        // microphoneRef.current.classList.remove("listening");
        SpeechRecognition.stopListening();
    };

    const handleReset = () => {
        stopHandle();
        resetTranscript();
    };

    const captureTranscript = (data) => {
        console.log('transcript data', data);
    };

    return (
        <div className="microphone-wrapper">
            <div className="mircophone-container">
                <button
                    type="button"
                    onClick={handleListing}
                    className="record-btn btn">Record</button>
                <div className="microphone-status">
                    {isListening ? "Listening........." : "Click to start Listening"}
                </div>
                {isListening && (
                    <button className="stop-btn" onClick={stopHandle}>
                        Stop
                    </button>
                )}
            </div>
            {transcript && (
                <div className="microphone-result-container">
                    <div
                        className="microphone-result-text"
                        onChange={captureTranscript}>
                            {transcript}
                    </div>
                    <button className="microphone-reset btn" onClick={handleReset}>
                        Reset
                    </button>
                </div>
            )}
        </div>
    );
}
export default SpeechRecognitionComponent;