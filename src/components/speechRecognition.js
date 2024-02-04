import React, { useEffect, useState } from "react";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import axios from "axios";
// import microPhoneIcon from "./microphone.svg";
import { classnames } from "../utils/general";
import compile from "../icons/compile.png";
import download from "../icons/download.png";
import generate from "../icons/generate.png";
import record from "../icons/record.png";
import stop from "../icons/stop.png";

function SpeechRecognitionComponent({ onChange, onCodeGenerated }) {
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
        if (onChange) {
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
            params: { COMMAND_PROMPT: transcript },
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
                // Use the prop function to send the data back
                if (onCodeGenerated) {
                    // props.onCodeGenerated(response.data); // Send the whole response back or just what you need
                    onCodeGenerated(codeResponse); // Send the whole response back or just what you need
                }
            })
            .catch((err) => {
                let error = err.response ? err.response.data : err;
                setProcessing(false);
                console.log(error);
            });
    };

    return (
        <div className="microphone-wrapper">
            <div className="microphone-container">
                {/* Flex container for buttons */}
                <div className="microphone-result-container">
                    <div className={classnames(
                        "focus:outline-none w-full border-2 border-black z-10 rounded-md shadow-[5px_5px_0px_0px_rgba(0,0,0)] px-4 py-2 hover:shadow transition duration-200 bg-white mt-2"
                    )}>
                        {transcript || "Your recorded speech will appear here."}
                    </div>
                </div>
                <div className="flex justify-start items-center space-x-2"> {/* Adjust the spacing and alignment as needed */}
                    <button
                        type="button"
                        onClick={handleListing}
                        className="record-btn btn">Start
                        <img src={record} alt="Start" className="icon-class" />
                    </button>

                    <button
                        className="record-btn btn"
                        onClick={handleSpeechToCode}>
                            Automate
                            <img src={generate} alt="Start" className="icon-class" />
                    </button>

                    {/* Conditionally render Stop button based on isListening state */}
                    {isListening && (
                        <button className="stop-btn" onClick={stopHandle}>
                            Stop
                        </button>
                    )}

                    {/* Reset button always shown */}
                    <button className="reset-btn btn" onClick={handleReset}>
                        Reset
                    </button>
                </div>

                <div className="microphone-status">
                    {isListening ? "Listening........." : ""}
                </div>
            </div>

        </div>
    );

}
export default SpeechRecognitionComponent;