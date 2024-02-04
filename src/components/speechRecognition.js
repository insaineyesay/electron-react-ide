import React, { useEffect, useState } from "react";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import axios from "axios";
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
    const { transcript, resetTranscript } = useSpeechRecognition({ speechCommands });
    const [isListening, setIsListening] = useState(false);
    const [processing, setProcessing] = useState(null);

    useEffect(() => {
        // Call the onChange prop function whenever transcript changes
        onChange(transcript);
    }, [transcript, onChange]); // Include onChange in the dependencies array


    useEffect(() => {
        // This function gets called every time `transcript` changes.
        // You can perform any action here, such as logging the transcript
        // or calling a function within this component.
        console.log('New transcript:', transcript);

        // Example function call with transcript
        handleTranscriptChange(transcript);
    }, [transcript]); // Dependency array, ensures useEffect runs on transcript change

    // Example internal function using transcript
    const handleTranscriptChange = (transcript) => {
        // Do something with the transcript data internally
        // For example, setting state, logging, or triggering another action
        console.log('Handling transcript change internally:', transcript);
        if(onChange) {
            onChange(transcript);
          }
    };

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

    const handleSpeechToCode = (e, value) => {
        // We will come to the implementation later in the code
        setProcessing(true);
        // const speechString = "give me the sql code to create a new databse";
        console.log('speech to string', value);
        const options = {
            method: "GET",
            url: "http://cors-anywhere.herokuapp.com/https://69da-216-54-50-106.ngrok-free.app/api/openai-api-call",
            params: { COMMAND_PROMPT: { transcript } },
            headers: {
                "ngrok-skip-browser-warning": "any",
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
            }
        };

        console.log(options);

        axios
            .request(options)
            .then(function (response) {
                console.log("res.data", response);
                const codeResponse = response.data.code_output;
            })
            .catch((err) => {
                let error = err.response ? err.response.data : err;
                setProcessing(false);
                console.log(error);
            });
    };

    return (
        <div className="microphone-wrapper">
            <div className="mircophone-container">
                <button
                    type="button"
                    onClick={handleListing}
                    className="record-btn btn">Record</button>
                <div className="flex flex-row">
                    <button onClick={handleSpeechToCode}>Convert Speech to Code</button>
                </div>
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
                    <div className="microphone-result-text">
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